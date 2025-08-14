import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { IPFS_GATEWAY_ADDRESS } from './consts';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const copyToClipboard = (value: string) =>
  navigator.clipboard.writeText(value).then(() => console.log('Copied!'));

export const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isNull = (value: unknown): value is null => value === null;
export const isNullOrUndefined = (value: unknown): value is null | undefined => isNull(value) || isUndefined(value);

export const getIpfsUrl = (value: string) => {
  if (!value.includes('ipfs://')) return `${IPFS_GATEWAY_ADDRESS}/${value}`; // legacy, remove after nft reupload

  const [, cid = ''] = value.split('ipfs://');

  return `${IPFS_GATEWAY_ADDRESS}/${cid}`;
};
