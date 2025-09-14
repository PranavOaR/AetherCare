import { ethers } from 'ethers';

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Get MetaMask provider
export const getMetaMaskProvider = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// Connect to MetaMask wallet
export const connectMetaMask = async (): Promise<string> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    const provider = getMetaMaskProvider();
    
    // Request account access
    await provider.send('eth_requestAccounts', []);
    
    // Get the signer (connected account)
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return address;
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) {
      throw new Error('User rejected the connection request');
    } else if (err.code === -32002) {
      throw new Error('Connection request is already pending. Please check MetaMask.');
    } else {
      throw new Error(err.message || 'Failed to connect to MetaMask');
    }
  }
};

// Get current connected account
export const getCurrentAccount = async (): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }

    const provider = getMetaMaskProvider();
    const accounts = await provider.listAccounts();
    
    return accounts.length > 0 ? accounts[0].address : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  if (isMetaMaskInstalled() && window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
    
    // Return cleanup function
    return () => {
      window.ethereum?.removeListener('accountsChanged', callback);
    };
  }
  return () => {};
};

// Format wallet address for display
export const formatWalletAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Open MetaMask installation page
export const openMetaMaskInstallPage = () => {
  window.open('https://metamask.io/download/', '_blank');
};
