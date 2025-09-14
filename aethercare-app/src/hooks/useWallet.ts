'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { 
  connectMetaMask, 
  getCurrentAccount, 
  onAccountsChanged, 
  isMetaMaskInstalled,
  openMetaMaskInstallPage
} from '@/lib/metamask';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load wallet address from Firestore
  const loadWalletAddress = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setWalletAddress(userData.walletAddress || null);
      }
    } catch (error) {
      console.error('Error loading wallet address:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Save wallet address to Firestore
  const saveWalletAddress = useCallback(async (address: string) => {
    if (!user?.uid) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        walletAddress: address,
        walletConnectedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error('Error saving wallet address:', error);
      throw error;
    }
  }, [user?.uid]);

  // Connect wallet function
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed!', {
        duration: 4000,
        action: {
          label: 'Install',
          onClick: openMetaMaskInstallPage,
        },
      });
      return;
    }

    if (!user) {
      toast.error('Please login first to connect your wallet');
      return;
    }

    setIsConnecting(true);
    
    try {
      const address = await connectMetaMask();
      await saveWalletAddress(address);
      setWalletAddress(address);
      toast.success('Wallet connected successfully! ✅');
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    if (!user?.uid) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        walletAddress: null,
        walletDisconnectedAt: new Date().toISOString(),
      }, { merge: true });
      setWalletAddress(null);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  // Check if current MetaMask account matches stored address
  const checkAccountSync = useCallback(async () => {
    if (!walletAddress || !isMetaMaskInstalled()) return;
    
    try {
      const currentAccount = await getCurrentAccount();
      if (currentAccount && currentAccount.toLowerCase() !== walletAddress.toLowerCase()) {
        // Account changed in MetaMask, update our records
        await saveWalletAddress(currentAccount);
        setWalletAddress(currentAccount);
        toast.success('Wallet account updated');
      } else if (!currentAccount && walletAddress) {
        // No account connected in MetaMask but we have one stored
        toast.error('Please connect to MetaMask or disconnect your wallet');
      }
    } catch (error) {
      console.error('Error checking account sync:', error);
    }
  }, [walletAddress, saveWalletAddress]);

  // Load wallet on user change
  useEffect(() => {
    if (user) {
      loadWalletAddress();
    } else {
      setWalletAddress(null);
      setIsLoading(false);
    }
  }, [user, loadWalletAddress]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const cleanup = onAccountsChanged(async (accounts) => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        if (walletAddress) {
          toast.error('MetaMask disconnected');
        }
      } else if (walletAddress && accounts[0].toLowerCase() !== walletAddress.toLowerCase()) {
        // User switched accounts
        if (user?.uid) {
          await saveWalletAddress(accounts[0]);
          setWalletAddress(accounts[0]);
          toast.success('Switched to new wallet account');
        }
      }
    });

    return cleanup;
  }, [walletAddress, user?.uid, saveWalletAddress]);

  // Periodic sync check
  useEffect(() => {
    const interval = setInterval(checkAccountSync, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkAccountSync]);

  return {
    walletAddress,
    isConnecting,
    isLoading,
    isConnected: !!walletAddress,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
};
