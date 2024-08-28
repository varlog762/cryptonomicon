<template>
  <section class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">{{ ticker }} - USD</h3>
    <div class="flex items-end border-gray-600 border-b border-l h-64" ref="graph">
      <div
        ref="graphElement"
        v-for="(bar, idx) in normalizeGraph"
        :key="idx"
        :style="{ height: `${bar}%` }"
        class="bg-purple-800 border w-10 shrink-0"
      ></div>
    </div>
    <button @click="$emit('graphWasClosed')" type="button" class="absolute top-0 right-0">
      <close-button-icon-component />
    </button>
  </section>
</template>

<script>
import CloseButtonIconComponent from './CloseButtonIconComponent.vue';

export default {
  data() {
    return {
      graph: [],
      maxGraphElements: 3
    };
  },

  mounted() {
    window.addEventListener('resize', this.calculateMaxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateMaxGraphElements);
  },

  components: {
    CloseButtonIconComponent
  },

  props: {
    ticker: {
      type: String,
      required: true
    },
    newPrice: {
      type: Number,
      required: true
    }
  },

  emits: {
    graphWasClosed: null
  },

  computed: {
    normalizeGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map((price) => 5 + ((price - minValue) * 95) / (maxValue - minValue));
    }
  },

  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph || !this.$refs.graphElement[0]) {
        return;
      }

      this.maxGraphElements = Math.floor(
        this.$refs.graph.clientWidth / this.$refs.graphElement[0].offsetWidth
      );
    },

    correctGraphElementsCount() {
      if (this.graph.length > this.maxGraphElements) {
        const startIdx = this.graph.length - this.maxGraphElements;

        this.graph = this.graph.slice(startIdx);
      }
    }
  },

  watch: {
    ticker() {
      this.graph = [];
    },

    newPrice() {
      this.graph.push(this.newPrice);
    },

    graph() {
      this.$nextTick().then(() => {
        this.calculateMaxGraphElements();
      });
    },

    maxGraphElements() {
      console.log(this.maxGraphElements);
      this.correctGraphElementsCount();
    }
  }
};
</script>
