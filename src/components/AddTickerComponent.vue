<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">Тикер</label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="searchInAvailableTickers"
            type="text"
            name="wallet"
            id="wallet"
            class="px-2 py-1 block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>

        <!-- Badge Container -->
        <div
          v-if="recomendedTickers.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="recomendedTicker in recomendedTickers"
            :key="recomendedTicker.symbol"
            @click="addTickerFromRecomended(recomendedTicker.symbol)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ recomendedTicker.symbol }}
          </span>
        </div>

        <!-- Error Message -->
        <div v-if="isTickerDuplicateError" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button-component @click="add" class="my-4" />
  </section>
</template>

<script>
import AddButtonComponent from './AddButtonComponent.vue';

import { loadAvailableTickers } from '@/services/loadAvailableTickersService';

export default {
  components: {
    AddButtonComponent
  },
  data() {
    return {
      ticker: '',
      availableTickersFromApi: [],
      recomendedTickers: []
    };
  },

  mounted() {
    this.getAvailableTickers();
  },

  props: {
    isTickerDuplicateError: {
      type: Boolean,
      required: true
    }
  },

  emits: {
    addTicker: (tickerName) => {
      return typeof tickerName === 'string';
    },
    resetDuplicateError: null
  },

  methods: {
    async getAvailableTickers() {
      this.availableTickersFromApi = await loadAvailableTickers();
    },

    add() {
      if (this.ticker) {
        this.$emit('addTicker', this.ticker.toUpperCase());

        setTimeout(() => {
          if (!this.isTickerDuplicateError) {
            this.recomendedTickers = [];
            this.ticker = '';
          }
        }, 100);
      }
    },

    addTickerFromRecomended(tickerName) {
      this.ticker = tickerName;

      this.add();
    },

    searchInAvailableTickers() {
      this.$emit('resetDuplicateError');

      if (this.ticker) {
        this.recomendedTickers = this.availableTickersFromApi
          .filter((item) => {
            if (item.fullName.toLowerCase().includes(this.ticker.toLowerCase())) {
              return item.symbol;
            }
          })
          .slice(0, 4);
      } else {
        this.recomendedTickers = [];
      }
    }
  }
};
</script>
