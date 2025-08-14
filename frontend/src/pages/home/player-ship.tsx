import { HexString } from '@gear-js/api';
import { useState } from 'react';

import { Button, Dialog } from '@/components';
import { buttonVariants } from '@/components/ui/button';
import { NFT_SHOWROOM_ADDRESS } from '@/consts';
import { cn } from '@/utils';

import { GAME_CONFIG } from './game-config';

type Props = {
  level: number;
  nft: { programId: HexString; id: string; mediaUrl: string } | undefined;
};

// for the main screen ship is 2x bigger
const BASE_SIZE = GAME_CONFIG.PLAYER_SHIP_BASE_SIZE * 2;
const SIZE_STEP = GAME_CONFIG.PLAYER_SHIP_SIZE_STEP * 2;

function PlayerShip({ level, nft }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const size = BASE_SIZE + SIZE_STEP * (level - 1);

  return (
    <>
      <button type="button" className="flex justify-center mb-4" disabled={!nft} onClick={openModal}>
        <img
          src={nft?.mediaUrl || '/img/starship-1.png'}
          alt="player ship"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </button>

      {isModalOpen && (
        <Dialog onClose={closeModal} title="Open NFT Showroom?" contentClassName="grid grid-cols-2">
          <Button variant="link" onClick={closeModal}>
            No
          </Button>

          <a
            href={`${NFT_SHOWROOM_ADDRESS}/nft/${nft?.programId}/${nft?.id}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'link' }))}>
            Yes
          </a>
        </Dialog>
      )}
    </>
  );
}

export { PlayerShip };
