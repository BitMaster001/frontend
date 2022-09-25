import React from 'react';
import { DivText } from 'src/components/Typo/Typo';
import { Spacer } from 'src/components/layout/Spacer';
import { LinkOut } from 'src/components/LinkOut';
import { MineableCoin } from '../mineableCoinList';
import { Trans, useTranslation } from 'next-i18next';
import { SectionWrapper, WalletTextField } from '../common';

type SetWalletSectionProps = {
  data: MineableCoin;
  name?: string;
};

export const SetWalletSection = ({
  data,
  name = 'wallet_address',
}: SetWalletSectionProps) => {
  const { t } = useTranslation('get-started');

  return (
    <SectionWrapper title={t('detail.wallet.title')}>
      <p>
        <Trans
          ns="get-started"
          i18nKey="detail.wallet.desc_one"
          components={{
            binance: (
              <LinkOut href="https://www.binance.com/en/register?ref=B2675KF5" />
            ),
            coinbase: <LinkOut href="https://www.coinbase.com" />,
          }}
        />
      </p>
      <p>
        <Trans
          ns="get-started"
          i18nKey="detail.wallet.desc_two"
          components={{
            ledger: <LinkOut href="https://www.ledger.com/" />,
            trezor: <LinkOut href="https://trezor.io/" />,
            strong: <strong />,
          }}
        />
      </p>
      <Spacer />
      <DivText>
        <WalletTextField name={name} data={data} />
      </DivText>
    </SectionWrapper>
  );
};
