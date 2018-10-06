<template>
  <div class="TransactionTable w-full">
    <vue-good-table
      :columns="columns"
      :rows="transactions"
      :sort-options="{
        enabled: true,
        initialSortBy: {field: 'timestamp', type: 'desc'}
      }"
      @on-row-click="onRowClick"
    >
      <template
        slot="table-row"
        slot-scope="table"
      >
        <a
          v-if="table.column.field === 'id'"
          href="#"
          @click.stop="network_openExplorer('transaction', table.row.id)"
        >
          {{ table.formattedRow['id'] }}
        </a>

        <div
          v-else-if="table.column.field === 'amount'"
          class="flex items-center justify-end"
        >
          <span
            v-tooltip="{ content: `${$t('TRANSACTION.AMOUNT')}: ${table.formattedRow['amount']} \n ${$t('TRANSACTION.FEE')}: ${formatAmount(table.row.fee)}`, trigger:'hover' }"
            class="font-bold mr-2"
          >
            {{ table.row.isSender ? '-' : '+' }}
            {{ table.formattedRow['amount'] }}
          </span>
          <span
            :class="{
              'text-red bg-red-lightest': table.row.isSender,
              'text-green bg-green-lightest': !table.row.isSender
            }"
            class="rounded-full h-6 w-6 flex items-center justify-center"
          >
            <SvgIcon
              :name="table.row.isSender ? 'arrow-sent' : 'arrow-received'"
              class="text-center"
              view-box="0 0 8 8"
            />
          </span>
        </div>

        <div v-else-if="table.column.field === 'sender'">
          <WalletAddress :address="table.row.recipient"/>
        </div>

        <div v-else-if="table.column.field === 'recipient'">
          <WalletAddress
            :address="table.row.recipient"
            :type="table.row.type"
            :asset="table.row.asset"
          />
        </div>

        <span v-else>
          {{ table.formattedRow[table.column.field] }}
        </span>
      </template>
    </vue-good-table>

    <portal
      v-if="selected"
      to="modal"
    >
      <TransactionShow
        :transaction="selected"
        @close="onCloseModal"
      />
    </portal>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon'
import truncateMiddle from '@/filters/truncate-middle'
import { TransactionShow } from '@/components/Transaction'
import WalletAddress from '@/components/Wallet/WalletAddress'

export default {
  name: 'TransactionTable',

  components: {
    SvgIcon,
    TransactionShow,
    WalletAddress
  },

  props: {
    transactions: {
      type: Array,
      required: true
    }
  },

  data: () => ({
    showModal: false,
    selected: null
  }),

  computed: {
    columns () {
      return [
        {
          label: this.$t('TRANSACTION.ID'),
          field: 'id',
          formatFn: this.formatLongString
        },
        {
          label: this.$t('COMMON.DATE'),
          field: 'timestamp',
          type: 'date',
          formatFn: this.formatDate,
          tdClass: 'text-center',
          thClass: 'text-center'
        },
        {
          label: this.$t('TRANSACTION.SENDER'),
          field: 'sender'
        },
        {
          label: this.$t('TRANSACTION.RECIPIENT'),
          field: 'recipient'
        },
        {
          label: this.$t('TRANSACTION.AMOUNT'),
          type: 'number',
          field: 'amount',
          formatFn: this.formatAmount,
          tdClass: 'text-right',
          thClass: 'text-right'
        }
      ]
    }
  },

  methods: {
    formatDate (value) {
      return this.$d(value, 'short')
    },

    formatAddress (value) {
      return this.wallet_formatAddress(value, 10)
    },

    formatLongString (value) {
      return truncateMiddle(value, 10)
    },

    formatAmount (value) {
      return this.currency_format(this.currency_subToUnit(value), { currencyFrom: 'network' })
    },

    openTransactions (id) {
      this.network_openExplorer('transaction', id)
    },

    onRowClick ({ row }) {
      this.selected = row
    },

    onCloseModal () {
      this.selected = null
    }
  }
}
</script>