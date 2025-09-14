'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { formatWalletAddress } from '@/lib/metamask';
import Image from 'next/image';

interface MetaMaskButtonProps {
  variant?: 'connect' | 'status';
  className?: string;
  showAddress?: boolean;
}

export const MetaMaskButton = ({ 
  variant = 'connect', 
  className = '',
  showAddress = false 
}: MetaMaskButtonProps) => {
  const { 
    walletAddress, 
    isConnecting, 
    isConnected, 
    connectWallet, 
    disconnectWallet
  } = useWallet();

  // Status variant - shows connection status
  if (variant === 'status') {
    const isCompact = className?.includes('compact');
    
    if (isConnected && walletAddress) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div 
            className={`flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg ${isCompact ? 'px-3 py-1.5 cursor-pointer hover:bg-green-100 transition-colors' : 'px-3 py-2'}`}
            onClick={isCompact ? disconnectWallet : undefined}
            title={isCompact ? 'Click to disconnect wallet' : undefined}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={`text-green-700 font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
              Wallet Connected
            </span>
            {showAddress && !isCompact && (
              <span className="text-green-600 text-xs font-mono">
                {formatWalletAddress(walletAddress)}
              </span>
            )}
            <span className="text-green-600">✅</span>
          </div>
          {!isCompact && (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Disconnect
            </Button>
          )}
        </div>
      );
    }

    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        size={isCompact ? "sm" : "default"}
        className={`bg-white text-black hover:bg-gray-100 font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center justify-center gap-2 ${isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'} ${className}`}
      >
        {isConnecting ? (
          <>
            <div className={`border-2 border-gray-300 border-t-black rounded-full animate-spin ${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
            {isCompact ? 'Connecting...' : 'Connecting...'}
          </>
        ) : (
          <>
            <Image
              src="/assets/metamask.jpg"
              alt="MetaMask"
              width={isCompact ? 16 : 20}
              height={isCompact ? 16 : 20}
              className="rounded"
            />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Connect variant - standard connect button for login/signup
  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`bg-white text-black hover:bg-gray-100 font-semibold px-6 py-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-md flex items-center justify-center gap-3 w-full ${className}`}
    >
      {isConnecting ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
          Connecting to MetaMask...
        </>
      ) : (
        <>
          <Image
            src="/assets/metamask.jpg"
            alt="MetaMask"
            width={24}
            height={24}
            className="rounded"
          />
          {isConnected ? 'Wallet Connected ✅' : 'Connect MetaMask Wallet'}
        </>
      )}
    </Button>
  );
};
