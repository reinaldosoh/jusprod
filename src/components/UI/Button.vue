<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  buttonType: {
    type: String,
    default: 'submit',
    validator: (value) => ['submit', 'button', 'reset'].includes(value)
  }
});
</script>

<template>
  <button 
    :class="[
      'button',
      `button--${type}`,
      { 'button--full-width': fullWidth }
    ]" 
    :disabled="disabled"
    :type="buttonType"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .button {
    height: 48px;
    width: 100% !important;
    max-width: 100% !important;
    font-size: 15px;
  }
}

.button--primary {
  background-color: #0468FA;
  color: white;
  border: none;
}

.button--primary:hover {
  background-color: #0354cc;
}

.button--outline {
  background-color: white;
  color: #0468FA;
  border: 1px solid #0468FA;
}

.button--outline:hover {
  background-color: #f5f9ff;
  box-shadow: 0 0 0 2px rgba(4, 104, 250, 0.1);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button--full-width {
  width: 100%;
}
</style>
