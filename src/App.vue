<script>
import '@/services/connectToWebSocket';
import { subscribeToTicker, unsubscribeFromTicker } from './services/updatePricesService';

import AddTickerComponent from './components/AddTickerComponent.vue';
import GraphComponent from './components/GraphComponent.vue';
import TrashIconComponent from './components/TrashIconComponent.vue';

// popup testing
import PopupComponent from './components/PopupComponent.vue';

export default {
  /**
   * Критерии оценки критичности проблемы:
   * 1. Проблема может уронить приложение - 5
   * 2. Проблемы безопасности/приватности - 5
   * 3. Проблема помешает увидеть пользователю запрошенные данные (неверные данные) - 5
   * 4. Проблема приводит к снижению производительности (утечкам памяти) приложения со временем - 5-4
   * 5. Приложение тормозин из-за неоптимальных решений в коде - 4-3
   * 6. Визуальные "косяки" не влияющие на отображение данных - 3-2
   * 7. Проблемы связанные с оформлением кода (повторяющийся код, плохие имена и т.п.), которые
   * не влияют на работ на работу приложения - 3-1
   * 8. Прочие мелкие проблемы (магические числа и т.п.) - 1
   */
  name: 'App',

  components: {
    AddTickerComponent,
    GraphComponent,
    TrashIconComponent,

    // popup testing
    PopupComponent
  },

  data() {
    return {
      ticker: '',
      filter: '',

      tickers: [],

      selectedTicker: null,
      page: 1,

      isTickerDuplicateError: false,

      // popup testing
      isPopupOpen: false
    };
  },
  mounted() {
    this.loadTickersFromLocalStorage();

    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }
  },

  computed: {
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    },
    startTickerIdx() {
      return (this.page - 1) * 6;
    },
    endTickerIdx() {
      return this.page * 6;
    },
    filteredTickers() {
      return this.filter
        ? this.tickers.filter((ticker) => ticker.name.includes(this.filter.toUpperCase()))
        : this.tickers;
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startTickerIdx, this.endTickerIdx);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endTickerIdx;
    },
    isTickerAlreadyAdded() {
      return this.tickers.some((t) => t.name === this.ticker);
    }
  },

  methods: {
    // popup testing
    popupConfirmed() {
      alert('Confirmed!');
    },
    // popup testing

    showTickerDuplicateError() {
      this.isTickerDuplicateError = true;
    },

    resetTickerDuplicateError() {
      this.isTickerDuplicateError = false;
    },

    subscribeToTickers() {
      this.tickers.forEach((ticker) => {
        const tickerName = ticker.name.toUpperCase();
        subscribeToTicker(tickerName, (newPrice) => {
          this.updateTicker(tickerName, newPrice);
        });
      });
    },

    loadTickersFromLocalStorage() {
      const localTickers = localStorage.getItem('tickersList');

      if (localTickers) {
        const tickerNames = JSON.parse(localTickers);
        this.tickers = tickerNames.map((tickerName) => {
          return {
            name: tickerName,
            price: '-'
          };
        });

        this.subscribeToTickers();
      }
    },

    formatPrice(price) {
      if (typeof price === 'string') {
        return price;
      }

      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    updateTicker(tickerName, newPrice) {
      const filteredTickers = this.tickers.filter((t) => t.name === tickerName);
      filteredTickers.forEach((t) => {
        t.price = newPrice;
      });
    },

    add(tickerName) {
      if (tickerName) {
        this.ticker = tickerName;

        if (this.isTickerAlreadyAdded) {
          this.showTickerDuplicateError();
          return;
        }

        this.resetTickerDuplicateError();

        const currentTicker = {
          name: tickerName,
          price: '-'
        };

        this.tickers = [...this.tickers, currentTicker];
        subscribeToTicker(currentTicker.name, (newPrice) => {
          this.updateTicker(currentTicker.name, newPrice);
        });

        this.ticker = '';
      }
    },

    selectTicker(ticker) {
      this.selectedTicker = ticker;
    },

    resetSelectedTickerAfterDelete(ticker) {
      if (this.selectedTicker && ticker.name === this.selectedTicker.name) {
        this.selectedTicker = null;
      }
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);

      if (!this.isTickerAlreadyAdded) {
        this.resetTickerDuplicateError();
      }

      unsubscribeFromTicker(tickerToRemove.name);

      this.resetSelectedTickerAfterDelete(tickerToRemove);
    },

    isValidPrice(ticker) {
      return typeof ticker.price === 'number';
    }
  },

  watch: {
    tickers() {
      if (localStorage) {
        const tickersCollection = this.tickers.map((ticker) => ticker.name);
        localStorage.setItem('tickersList', JSON.stringify(tickersCollection));
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },

    paginatedTickers() {
      if (!this.paginatedTickers.length && this.page > 1) {
        this.page -= 1;
      }
    }
  }
};
</script>

<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!-- SPINNER -->

    <!-- <div class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">
      <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </div> -->

    <div class="container">
      <add-ticker-component
        :isTickerDuplicateError="isTickerDuplicateError"
        @add-ticker="add"
        @reset-duplicate-error="resetTickerDuplicateError"
      />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="page > 1"
            @click="page = page - 1"
          >
            Назад
          </button>
          <button
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="page = +page + 1"
            v-if="hasNextPage"
          >
            Вперед
          </button>
          <div>Фильтр: <input v-model="filter" /></div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />

        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="selectTicker(t)"
            :class="{
              'border-4': selectedTicker === t
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center" :class="{ 'bg-red-100': !isValidPrice(t) }">
              <dt class="text-sm font-medium text-gray-500 truncate">{{ t.name }} - USD</dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <trash-icon-component />
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <graph-component
        v-if="selectedTicker"
        :ticker="selectedTicker.name"
        :new-price="selectedTicker.price"
        @graph-was-closed="selectedTicker = null"
      />
      <!-- popup testing start-->
      <hr />
      <button @click="isPopupOpen = true" class="popup-open-btn">Open popup</button>
      <popup-component :is-open="isPopupOpen" @ok="popupConfirmed" @close="isPopupOpen = false"
        >Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi delectus dolor labore! Nobis
        numquam eius laudantium perferendis vitae, consectetur temporibus nulla dolorem nemo alias
        totam porro rerum exercitationem? Fugiat, quibusdam.</popup-component
      >
      <!-- popup testing end -->
    </div>
  </div>
</template>

<style>
.popup-open-btn {
  border: 1px solid black;
  border-radius: 5px;
  background-color: #fff;
  padding: 2px 4px;
}
</style>
