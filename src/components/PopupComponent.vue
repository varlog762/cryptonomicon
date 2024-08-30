<template>
  <div class="backdrop" v-if="isOpen" @click.self="closePopup">
    <div class="popup">
      <h1>Attention!</h1>
      <hr />
      <slot></slot>
      <hr />
      <div class="footer">
        <slot name="controls" :confirmFn="confirmPopup">
          <button
            @click="$emit('close')"
            class="bg-slate-200 border-1 p-1 px-2 mt-2 mr-2 rounded-md"
          >
            Cancel
          </button>
          &nbsp;
          <button @click="$emit('ok')" class="bg-slate-200 border-1 p-1 px-2 mt-2 mr-2 rounded-md">
            Ok
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import C from '@/constants/constants';

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },

  emits: {
    ok: null,
    close: null
  },

  mounted() {
    document.addEventListener('keydown', this.closePopupWhenEscapeButtonPressed);
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.closePopupWhenEscapeButtonPressed);
  },

  methods: {
    closePopupWhenEscapeButtonPressed(e) {
      if (e.key === C.ESCAPE_KEY) {
        this.closePopup();
      }
    },

    closePopup() {
      this.$emit('close');
    },

    confirmPopup() {
      this.$emit('ok');
    }
  }
};
</script>

<style>
.popup {
  top: 50%;
  padding: 20px;
  left: 50%;
  transform: translate(-50%, -50%);
  position: fixed;
  z-index: 101;
  background-color: white;
  border-radius: 10px;
}

.popup h1 {
  text-align: center;
  margin: 0;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
}

.footer {
  text-align: right;
}
</style>
