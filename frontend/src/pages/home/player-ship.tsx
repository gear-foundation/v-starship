import { HexString } from '@gear-js/api';
import { Modal, Button } from '@gear-js/vara-ui';
import { useState } from 'react';

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
        <Modal close={closeModal} heading="Open NFT Showroom portal?" className="grid grid-cols-2 gap-8">
          <Button onClick={closeModal}>No</Button>

          <a
            href={`https://nft-showroom.vara.network/nft/${nft?.programId}/${nft?.id}`}
            target="_blank"
            rel="noreferrer">
            Yes
          </a>
        </Modal>
      )}
    </>
  );
}

export { PlayerShip };
