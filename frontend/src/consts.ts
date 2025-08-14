const ENV = {
  NODE: import.meta.env.VITE_NODE_ADDRESS as string,
};

const NFT_SHOWROOM_ADDRESS = import.meta.env.VITE_NFT_SHOWROOM_ADDRESS as string;
const IPFS_GATEWAY_ADDRESS = import.meta.env.VITE_IPFS_GATEWAY_ADDRESS as string;

export { ENV, NFT_SHOWROOM_ADDRESS, IPFS_GATEWAY_ADDRESS };
