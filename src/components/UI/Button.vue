<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'white', 'link'].includes(value)
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
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
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

.button--secondary {
  background-color: #F8FAFC;
  color: #0468FA;
  border: 1px solid #0468FA;
}

.button--secondary:hover {
  background-color: #E5F3FF;
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

.button--white {
  background-color: white;
  color: #0468FA;
  border: 1px solid white;
}

.button--white:hover {
  background-color: #F8FAFC;
  border-color: #F8FAFC;
}

.button--link {
  background: none;
  border: none;
  color: #475467;
  font-size: 14px;
  padding: 0;
  height: auto;
  width: auto;
  text-decoration: none;
}

.button--link:hover {
  text-decoration: underline;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button--full-width {
  width: 100%;
}
</style>
