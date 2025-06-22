<script setup>
import { ref, computed } from 'vue';
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update:modelValue', 'blur', 'focus', 'input', 'keydown']);

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
});

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password';
  }
  return props.type;
});

// Função para lidar com blur
const handleBlur = (event) => {
  emits('blur', event);
};

// Função para lidar com focus
const handleFocus = (event) => {
  emits('focus', event);
};

// Função para lidar com input
const handleInput = (event) => {
  emits('input', event);
};

// Função para lidar com keydown
const handleKeydown = (event) => {
  emits('keydown', event);
};
</script>

<template>
  <div class="input-container">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-wrapper" :class="{ 'input-error': error }">
      <div class="icon-container">
        <slot name="icon">
          <Mail v-if="type === 'email'" size="20" />
          <Lock v-else-if="type === 'password'" size="20" />
          <slot v-else></slot>
        </slot>
      </div>
      <input
        :type="inputType"
        v-model="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
        @keydown="handleKeydown"
      />
      <div v-if="type === 'password'" class="password-toggle" @click="togglePasswordVisibility">
        <EyeOff v-if="!showPassword" size="20" />
        <Eye v-else size="20" />
      </div>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-container {
  width: 100%;
  margin-bottom: 16px;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #344054;
  text-align: left;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .input-wrapper {
    height: 48px;
  }
  
  .input-field {
    font-size: 15px;
  }
}

.input-wrapper:focus-within {
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 100%;
  color: #667085;
}

.input-field {
  flex: 1;
  height: 100%;
  padding: 0;
  border: none;
  outline: none;
  font-size: 16px;
  color: #101828;
  background: transparent;
}

.input-field::placeholder {
  color: #667085;
}

.password-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 100%;
  color: #667085;
  cursor: pointer;
}

.input-error {
  border-color: #F04438;
}

.input-error:focus-within {
  border-color: #F04438;
  box-shadow: 0 0 0 4px rgba(240, 68, 56, 0.1);
}

.error-message {
  margin-top: 6px;
  font-size: 14px;
  color: #F04438;
}
</style>
