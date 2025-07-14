import { useAccount, useDeriveBalancesAll } from '@gear-js/react-hooks';

function useVaraBalance() {
  const { account } = useAccount();

  return useDeriveBalancesAll({
    address: account?.address,
    query: { select: (data) => data.transferable?.toBigInt() },
    watch: true,
  });
}

export { useVaraBalance };
