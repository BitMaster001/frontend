import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from 'src/components/Button';
import DynamicList from 'src/components/layout/List/List';
import { Spacer } from 'src/components/layout/Spacer';
import { LinkOutCoin } from 'src/components/LinkOut';
import { Mono, Ws } from 'src/components/Typo/Typo';
import { useLocalizedActiveCoinValueFormatter } from 'src/hooks/useDisplayReward';
import useMinerPaymentsQuery from '@/hooks/api/useMinerPaymentsQuery';
import { useCounterTicker } from 'src/rdx/localSettings/localSettings.hooks';
import { ApiMinerPayment } from 'src/types/Miner.types';
import { ApiPoolCoin } from 'src/types/PoolCoin.types';
import { getCoinLink } from 'src/utils/coinLinks.utils';
import { useLocalizedDateFormatter } from 'src/utils/date.utils';
import { Tooltip, TooltipContent } from 'src/components/Tooltip';
import Stack from '@/components/Stack';
import { TableCellSpinner } from 'src/components/Loader/TableCellSpinner';
import { useLocalStorageState } from 'src/hooks/useLocalStorageState';
import {
  useLocalizedCurrencyFormatter,
  useLocalizedNumberFormatter,
} from 'src/utils/si.utils';
import styled from 'styled-components';
import { BiTransferAlt } from 'react-icons/bi';
import NetworkLogo from '@/components/NetworkLogo';

const HeaderSplit = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StatusContainer = styled.span<{
  confirmed: ApiMinerPayment['confirmed'];
}>`
  display: inline-block;
  text-transform: capitalize;
  white-space: nowrap;
  & + * {
    margin-left: 0.5rem;
  }
  ${(p) =>
    p.confirmed === true &&
    `
      color: var(--success);
  `}
  ${(p) =>
    !p.confirmed &&
    `
      color: var(--text-secondary);
  `}
  + * svg {
    fill: var(--text-tertiary);
  }
`;

const ButtonDateSwitch = styled(Ws)`
  padding: 0 0.35rem;
  outline: none;
  border: none;
  color: var(--text-secondary);
  svg {
    opacity: 0.5;
    margin-left: 0.3rem;
  }
  &:hover svg {
    color: var(--primary);
    opacity: 1;
  }
`;

export const MinerPaymentsList: React.FC<{
  address: string;
  coin?: ApiPoolCoin;
}> = ({ coin, address }) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const counterTicker = useCounterTicker();

  const { data: minerPayments, isFetching } = useMinerPaymentsQuery({
    address,
    coin: coin?.ticker as string,
    countervalue: counterTicker,
    page: currentPage,
  });

  const activeCoinFormatter = useLocalizedActiveCoinValueFormatter();
  const numberFormatter = useLocalizedNumberFormatter();
  const [dateView, setDateView] = useLocalStorageState<
    'full_date' | 'distance'
  >('blockDateView', 'distance');

  const { totalItems, totalPages } = React.useMemo(() => {
    return {
      totalItems: minerPayments?.totalItems || 0,
      totalPages: minerPayments?.totalPages || 0,
    };
  }, [minerPayments]);

  const currentCounterValuePrice = minerPayments?.countervalue || 1;

  const { t } = useTranslation('dashboard');
  const currencyFormatter = useLocalizedCurrencyFormatter();
  const dateFormatter = useLocalizedDateFormatter();
  const handleRowClick = React.useCallback(
    (data: ApiMinerPayment) => {
      let coinName = coin?.ticker as string;

      if (data.network !== 'mainnet') {
        coinName = data.network;
      }

      window.open(getCoinLink('transaction', data.hash, coinName), '_blank');
    },
    [coin?.ticker]
  );

  return (
    <>
      <Spacer size="lg" />
      <HeaderSplit>
        <div>
          <h2>{t('payments.table.title')}</h2>
        </div>
        <Stack>
          <Button
            size="xs"
            as="a"
            className="export-button"
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/miner/export/payments.pdf?coin=${coin?.ticker}&address=${address}&countervalue=${counterTicker}`}
          >
            {t('payments.table.download_pdf')}
          </Button>
          <Button
            size="xs"
            as="a"
            className="export-button"
            href={`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/miner/export/payments.csv?coin=${coin?.ticker}&address=${address}&countervalue=${counterTicker}`}
          >
            {t('payments.table.download')}
          </Button>
        </Stack>
      </HeaderSplit>
      <Spacer />
      <DynamicList
        isLoading={isFetching}
        onRowClick={handleRowClick}
        pagination={{
          currentPage,
          setCurrentPage,
          totalPages,
        }}
        data={minerPayments?.data || []}
        columns={[
          {
            title: '#',
            Component: ({ data, index }) => {
              return (
                <Mono>
                  #
                  {(totalItems % 10) -
                    index +
                    (totalPages - (currentPage + 1)) * 10}
                </Mono>
              );
            },
          },
          {
            title: t('payments.table.table_head.date'),
            Component: ({ data }) => {
              return (
                <ButtonDateSwitch
                  onClick={(e) => {
                    setDateView(
                      dateView === 'full_date' ? 'distance' : 'full_date'
                    );
                    e.stopPropagation();
                  }}
                >
                  {dateView === 'full_date'
                    ? dateFormatter.dateAndTime(data.timestamp * 1000)
                    : dateFormatter.distanceFromNow(data.timestamp * 1000)}
                  <BiTransferAlt />
                </ButtonDateSwitch>
              );
            },
          },
          {
            title: t('payments.table.table_head.value'),
            alignRight: true,
            Component: ({ data }) => {
              const value = activeCoinFormatter(data.value);

              const tickerValue = coin
                ? (data.value / Math.pow(10, coin.decimalPlaces)) *
                  currentCounterValuePrice
                : null;

              return (
                <Tooltip
                  wrapIcon={false}
                  icon={
                    <Ws>
                      {value} ({currencyFormatter(data.countervalue)})
                      <span className="reward"></span>
                    </Ws>
                  }
                >
                  <TooltipContent>
                    Now: {currencyFormatter(tickerValue || 0)}
                  </TooltipContent>
                </Tooltip>
              );
            },
          },
          {
            title: t('payments.table.table_head.fee'),
            alignRight: true,
            Component: ({ data }) => {
              return (
                <Tooltip
                  wrapIcon={false}
                  icon={
                    <Ws>
                      {numberFormatter(data.feePercent, {
                        style: 'percent',
                        maximumFractionDigits: 3,
                      })}{' '}
                      (
                      {coin &&
                        currencyFormatter(data.feePercent * data.countervalue)}
                      )
                    </Ws>
                  }
                >
                  <TooltipContent>
                    Now:{' '}
                    {coin &&
                      currencyFormatter(
                        (data.fee / Math.pow(10, coin.decimalPlaces)) *
                          currentCounterValuePrice
                      )}
                  </TooltipContent>
                </Tooltip>
              );
            },
          },
          {
            title: t('payments.table.table_head.duration'),
            alignRight: true,
            Component: ({ data }) => {
              return (
                <Ws>
                  {dateFormatter.durationWords(data.duration, {
                    includeSeconds: false,
                    short: true,
                  })}
                </Ws>
              );
            },
          },
          {
            title: t('payments.table.table_head.status'),
            alignRight: true,
            Component: ({ data }) => {
              return (
                <Ws>
                  {data.confirmed ? (
                    <StatusContainer confirmed={data.confirmed}>
                      {t('payments.table.table_contents.success')}{' '}
                      <Tooltip>
                        <TooltipContent>
                          {data?.confirmedTimestamp - data?.timestamp < 10800
                            ? `${t(
                                'confirmation_duration_tooltip'
                              )} ${dateFormatter.durationWords(
                                data.confirmedTimestamp - data.timestamp,
                                {
                                  includeSeconds:
                                    data?.confirmedTimestamp - data?.timestamp <
                                    3600
                                      ? true
                                      : false,
                                  short: false,
                                }
                              )}`
                            : `${t(
                                'confirmed_at_tooltip'
                              )} ${dateFormatter.dateAndTime(
                                data.confirmedTimestamp * 1000
                              )}`}
                        </TooltipContent>
                      </Tooltip>
                    </StatusContainer>
                  ) : (
                    <>
                      <StatusContainer confirmed={data.confirmed}>
                        {t('payments.table.table_contents.pending')}
                      </StatusContainer>
                      <Tooltip icon={<TableCellSpinner />}>
                        <TooltipContent message={t('status_pending_tooltip')} />
                      </Tooltip>
                    </>
                  )}
                </Ws>
              );
            },
          },
          {
            title: t('payments.table.table_head.hash'),
            alignRight: true,
            Component: ({ data }) => {
              let coinName = coin?.ticker as string;

              if (data.network !== 'mainnet') {
                coinName = data.network;
              }

              return (
                <Stack spacing="xs">
                  <NetworkLogo
                    ticker={coin?.ticker as string}
                    network={data.network}
                  />
                  <Ws>
                    <Mono className="item-hover-higjlight">
                      <LinkOutCoin
                        type="transaction"
                        hash={data.hash}
                        coin={coinName}
                      />
                    </Mono>
                  </Ws>
                </Stack>
              );
            },
          },
        ]}
      />
    </>
  );
};
