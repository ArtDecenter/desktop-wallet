<template>
  <div class="TokenExchangeCampaign relative bg-theme-feature rounded-lg m-r-4">
    <main class="flex flex-col sm:flex-row h-full">
      <div
        :style="`background-image: url('${assets_loadImage(backgroundImages[session_hasDarkTheme][step])}')`"
        class="TokenExchangeCampaign__instructions sm:flex-grow background-image sm:w-1/2 lg:w-3/5"
      >
        <div class="instructions-text my-8 sm:mt-16 sm:mb-0 mx-8 sm:mx-16 w-auto md:w-1/2">
          <h3 class="mb-2 text-theme-page-instructions-text">
            {{ $t(`PAGES.TEC.STEP${step}.INSTRUCTIONS.HEADER`) }}
          </h3>

          <p v-if="step === 1">
            {{ $t('PAGES.TEC.STEP1.INSTRUCTIONS.TEXT_BEFORE_BUTTON') }}

            <ButtonReload
              :is-refreshing="isRefreshing"
              :without-background="true"
              class="TokenExchangeCampaign__refresh-button inline"
              text-class="text-theme-page-instructions-text"
              @click="refreshPrices"
            />

            {{ $t('PAGES.TEC.STEP1.INSTRUCTIONS.TEXT_AFTER_BUTTON') }}
          </p>
          <p v-else-if="step === 3">
            {{ $t('PAGES.TEC.STEP3.INSTRUCTIONS.TEXT_BEFORE_BUTTON') }}

            {{ tickers[selectedCurrency] }}

            {{ $t('PAGES.TEC.STEP3.INSTRUCTIONS.TEXT_AFTER_BUTTON') }}
          </p>
          <p v-else>
            {{ $t(`PAGES.TEC.STEP${step}.INSTRUCTIONS.TEXT`) }}
          </p>
        </div>
      </div>

      <div class="flex-no-grow p-10 sm:w-1/2 lg:w-2/5">
        <MenuStep
          :step="step"
        >
          <MenuStepItem
            :step="1"
            :is-next-enabled="currencyPicked"
            :title="$t('PAGES.TEC.STEP1.TITLE')"
            @next="moveTo(2)"
          >
            <div
              slot="header"
              slot-scope="{ title }"
              class="flex flex-row justify-between items-center"
            >
              <div class="">
                {{ title }}
              </div>

              <!-- Hide it when the step is collapsed -->
              <ButtonReload
                v-if="step === 1"
                :is-refreshing="isRefreshing"
                class="TokenExchangeCampaign__refresh-button"
                @click="refreshPrices"
              />
            </div>

            <TransitionGroup
              class="list-reset flex flex-col"
              name="TokenExchangeCampaign__currencies"
              tag="ul"
            >
              <li
                v-for="currency in currencies"
                :key="currency"
                class="flex flex-row p-2 w-full justify-between"
              >
                <div
                  class="flex flex-row items-center">
                  <SvgIcon
                    class="fill-current"
                    :name="currency"
                    view-box="0 0 35 35"
                  />
                  <a
                    :class="{ 'TokenExchangeCampaign__currencies--selected': selectedCurrency === currency }"
                    class="TokenExchangeCampaign__currencies--name text-theme-currency-unselected ml-2 cursor-pointer flex-no-shrink"
                    @click="selectCurrency(currency)"
                  >
                    <span class="font-semibold text-sm">
                      {{ currency }}
                    </span>
                  </a>
                </div>
                <div class="self-center">
                  <span
                    class="font-bold text-theme-currency-unselected"
                    :class="{ 'TokenExchangeCampaign__currencies--price--selected': selectedCurrency === currency }"
                  >
                    {{ prices[currency] }} AD
                  </span>
                </div>
              </li>
            </TransitionGroup>
          </MenuStepItem>

          <MenuStepItem
            :step="2"
            :is-back-visible="true"
            :is-next-enabled="walletPicked"
            :title="$t('PAGES.TEC.STEP2.TITLE')"
            @back="moveTo(1)"
            @next="moveTo(3)"
          >
            <div
              slot="header"
              slot-scope="{ title }"
              class="flex flex-row justify-between items-center"
            >
              <div class="">
                {{ title }}
              </div>
            </div>

            <TransitionGroup
              class="list-reset"
              name="TokenExchangeCampaign__wallets"
              tag="ul"
            >
              <li
                v-for="wallet in wallets"
                :key="wallet.address"
                class="flex items-center py-4 w-full border-b border-dashed border-theme-line-separator truncate"
              >
                <WalletIdenticon
                  :value="wallet.address"
                  :size="35"
                  class="flex-no-shrink"
                />
                <a
                  :class="{ 'TokenExchangeCampaign__wallets--selected': selectedWallet === wallet }"
                  class="TokenExchangeCampaign__wallets--address text-theme-wallet-new-unselected ml-2 cursor-pointer flex-no-shrink"
                  @click="selectWallet(wallet)"
                >
                  <span class="font-semibold text-sm">
                    {{ wallet.address }}
                  </span>
                </a>
              </li>
            </TransitionGroup>
          </MenuStepItem>

          <MenuStepItem
            :step="3"
            :is-back-visible="true"
            :is-next-enabled="true"
            :title="$t('PAGES.TEC.STEP3.TITLE')"
            @back="moveTo(2)"
            @next="done"
          >
            <div
              slot="header"
              slot-scope="{ title }"
              class="flex flex-row justify-between items-center"
            >
              <div class="">
                {{ title }}
              </div>
            </div>
            <div class="flex flex-row items-center justify-start px-2">
              <!-- Hide it when the step is collapse -->
              <span class="font-semibold px-1">
                {{ sendToAddress }}
              </span>
              <ButtonClipboard
                v-if="step === 3"
                :value="sendToAddress"
                class="text-theme-button-light-text py-2 px-4 rounded bg-theme-button-light"
              />
            </div>
          </MenuStepItem>
        </MenuStep>
      </div>
      <ModalLoader
        :message="$t('PAGES.TEC.PROCESSING')"
        :visible="showTecProcessing"
      />
    </main>
  </div>
</template>

<script>
import { ButtonClipboard, ButtonReload } from '@/components/Button'
import { MenuStep, MenuStepItem } from '@/components/Menu'
import { ModalLoader } from '@/components/Modal'
import { WalletIdenticon } from '@/components/Wallet'
import { SvgIcon } from '@/components/SvgIcon'

export default {
  name: 'TokenExchangeCampaign',

  components: {
    ButtonClipboard,
    ButtonReload,
    MenuStep,
    MenuStepItem,
    ModalLoader,
    WalletIdenticon,
    SvgIcon
  },

  data: () => ({
    currencyPicked: false,
    selectedCurrency: null,
    walletPicked: false,
    selectedWallet: null,
    sendToAddress: null,
    isRefreshing: false,
    step: 1,
    currencies: [
      'Ark', 'Bitcoin', 'Ethereum', 'Litecoin', 'Monero'
    ],
    tickers: {
      Art: 'AD',
      Ark: 'ARK',
      Bitcoin: 'BTC',
      Ethereum: 'ETH',
      Litecoin: 'LTC',
      Monero: 'XMR'
    },
    prices: {
      Ark: null,
      Bitcoin: null,
      Ethereum: null,
      Litecoin: null,
      Monero: null
    },
    showTecProcessing: false
  }),

  computed: {
    wallets () {
      return this.$store.getters['wallet/byProfileId'](this.session_profile.id).slice()
    },

    backgroundImages () {
      return {
        true: {
          1: 'pages/wallet-new/background-step-1-dark.png',
          2: 'pages/wallet-new/background-step-2-dark.png',
          3: 'pages/wallet-new/background-step-3-dark.png',
          4: 'pages/wallet-new/background-step-2-dark.png',
          5: 'pages/wallet-new/background-step-5-dark.png'
        },
        false: {
          1: 'pages/wallet-new/background-step-1.png',
          2: 'pages/wallet-new/background-step-2.png',
          3: 'pages/wallet-new/background-step-3.png',
          4: 'pages/wallet-new/background-step-2.png',
          5: 'pages/wallet-new/background-step-5.png'
        }
      }
    }
  },

  created () {
    this.refreshPrices()
  },

  methods: {
    refreshPrices () {
      this.isRefreshing = true
      const res = {
        prices: {
          Ark: 1,
          Bitcoin: 2,
          Ethereum: 3,
          Litecoin: 4,
          Monero: 5
        }
      }
      setTimeout(() => {
        this.prices = res.prices
        this.isRefreshing = false
      }, 300)
    },
    selectCurrency (currency) {
      this.selectedCurrency = currency
      this.currencyPicked = true
    },
    selectWallet (wallet) {
      this.selectedWallet = wallet
      this.walletPicked = true
    },
    moveTo (step) {
      switch (step) {
        case 1:

          break
        case 2:

          break
        case 3:
          this.generateTecAddress(this.selectedWallet, this.selectedCurrency)
          break
      }

      this.step = step
      /**    if (step === 3) {
        this.showTecProcessing = true
        this.generateTecAddress(this.selectedWallet, this.selectedCurrency)
      } else {
        this.showTecProcessing = false
      }
      */
    },
    generateTecAddress (wallet, currency) {
      this.showTecProcessing = true
      try {
        // https post

        const sendToAddress = 'D7h9uZHJAA37j9UnSs9zbhkEv6QtKGrSGL'

        this.$store.dispatch('wallet/link', { ...wallet, currency, sendToAddress })
        this.sendToAddress = sendToAddress
        this.showTecProcessing = false
      } catch (e) {

      }
    },
    done () {
      this.$router.push({ name: 'wallet-show', params: { address: this.selectedWallet.address } })
    }
  }
}
</script>

<style>
.TokenExchangeCampaign .Collapse.MenuStepItem .Collapse__handler {
  width: 100%;
  text-align: left;
  vertical-align: middle;
  pointer-events: none;
}
.TokenExchangeCampaign .Collapse.MenuStepItem .Collapse__handler .TokenExchangeCampaign__refresh-button,
.TokenExchangeCampaign .Collapse.MenuStepItem .Collapse__handler .ButtonClipboard {
  pointer-events: visible;

}
</style>

<style lang="postcss" scoped>
/* To display the images scaled to the size of the button */
.TokenExchangeCampaign__instructions {
  background-size: cover;
  background-position: center center;
}

.TokenExchangeCampaign__currencies-enter-active {
  transition: opacity 1s
}
.TokenExchangeCampaign__currencies-leave-active {
  transition: opacity 0.2s
}

.TokenExchangeCampaign__currencies-enter,
.TokenExchangeCampaign__currencies-leave-to {
  opacity: 0
}

.TokenExchangeCampaign__currencies--selected {
  @apply .text-theme-currency-selected .font-bold .underline
}

.TokenExchangeCampaign__currencies--price--selected {
  @apply .text-theme-currency-selected
}

.TokenExchangeCampaign__currencies--name {
  transition: all 0.5s;
}
.TokenExchangeCampaign__currencies--name:hover {
  transition: all 0.5s;
  @apply .text-theme-currency-selected
}

.TokenExchangeCampaign__wallets-enter-active {
  transition: opacity 1s
}
.TokenExchangeCampaign__wallets-leave-active {
  transition: opacity 0.2s
}

.TokenExchangeCampaign__wallets-enter,
.TokenExchangeCampaign__wallets-leave-to {
  opacity: 0
}

.TokenExchangeCampaign__wallets--selected {
  @apply .text-theme-wallet-new-selected .font-bold
}

.TokenExchangeCampaign__wallets--address {
  transition: all 0.5s;
}
.TokenExchangeCampaign__wallets--address:hover {
  transition: all 0.5s;
  @apply .text-theme-wallet-new-selected .no-underline
}
</style>
