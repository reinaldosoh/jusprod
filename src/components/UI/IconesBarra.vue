<template>
  <div class="view-icons-group">
    <!-- Ícone Kanban -->
    <button 
      class="view-btn" 
      :class="{ active: activeView === 'kanban' }" 
      title="Visualização kanban" 
      @click="$emit('view-change', 'kanban')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9H21M3 15H21M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z" 
        :stroke="activeView === 'kanban' ? '#0C66FF' : '#000000'" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      </svg>
    </button>
    
    <!-- Ícone Lista -->
    <button 
      class="view-btn" 
      :class="{ active: activeView === 'list' }" 
      title="Visualização em lista" 
      @click="$emit('view-change', 'list')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12L9 12M21 6L9 6M21 18L9 18M5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" 
        :stroke="activeView === 'list' ? '#0C66FF' : '#000000'" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      </svg>
    </button>
    
    <!-- Traço Vertical -->
    <div class="vertical-divider"></div>
    
    <!-- Ícone Favoritos -->
    <button 
      class="action-btn" 
      :class="{ active: showFavorites }" 
      title="Favoritos"
      @click="toggleFavorites"
    >
      <!-- SVG quando ativo (favorito_select.svg) -->
      <svg v-if="showFavorites" width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.3421 3.16556C10.5534 2.73753 10.659 2.52352 10.8024 2.45514C10.9272 2.39565 11.0722 2.39565 11.1969 2.45514C11.3404 2.52352 11.446 2.73753 11.6573 3.16556L13.6617 7.22636C13.7241 7.35273 13.7553 7.41591 13.8009 7.46496C13.8412 7.5084 13.8896 7.54359 13.9434 7.56859C14.0041 7.59683 14.0738 7.60702 14.2133 7.6274L18.6969 8.28275C19.1691 8.35176 19.4051 8.38627 19.5144 8.50159C19.6094 8.60192 19.6542 8.73979 19.6361 8.87681C19.6153 9.0343 19.4443 9.20077 19.1025 9.5337L15.8593 12.6926C15.7582 12.791 15.7077 12.8403 15.6751 12.8989C15.6462 12.9507 15.6277 13.0077 15.6205 13.0667C15.6124 13.1332 15.6244 13.2028 15.6482 13.3419L16.4135 17.8036C16.4942 18.2742 16.5345 18.5095 16.4587 18.6491C16.3927 18.7706 16.2754 18.8558 16.1395 18.881C15.9832 18.91 15.7719 18.7989 15.3494 18.5766L11.341 16.4687C11.2161 16.403 11.1537 16.3702 11.0879 16.3573C11.0296 16.3459 10.9697 16.3459 10.9115 16.3573C10.8457 16.3702 10.7832 16.403 10.6584 16.4687L6.65002 18.5766C6.22743 18.7989 6.01613 18.91 5.8599 18.881C5.72397 18.8558 5.60667 18.7706 5.54068 18.6491C5.46484 18.5095 5.5052 18.2742 5.58591 17.8036L6.35115 13.3419C6.37501 13.2028 6.38694 13.1332 6.37887 13.0667C6.37172 13.0077 6.35319 12.9507 6.32431 12.8989C6.29169 12.8403 6.24114 12.791 6.14004 12.6926L2.89685 9.5337C2.55503 9.20077 2.38412 9.0343 2.36332 8.87681C2.34523 8.73979 2.38993 8.60192 2.48499 8.50159C2.59424 8.38627 2.83031 8.35176 3.30246 8.28275L7.78613 7.6274C7.92556 7.60702 7.99528 7.59683 8.056 7.56859C8.10976 7.54359 8.15816 7.5084 8.19851 7.46496C8.24409 7.41591 8.27528 7.35273 8.33765 7.22636L10.3421 3.16556Z" fill="#0C66FF"/>
      </svg>
      
      <!-- SVG quando inativo (favoritar.svg) -->
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.2827 3.45332C11.5131 2.98638 11.6284 2.75291 11.7848 2.67831C11.9209 2.61341 12.0791 2.61341 12.2152 2.67831C12.3717 2.75291 12.4869 2.98638 12.7174 3.45332L14.9041 7.88328C14.9721 8.02113 15.0061 8.09006 15.0558 8.14358C15.0999 8.19096 15.1527 8.22935 15.2113 8.25662C15.2776 8.28742 15.3536 8.29854 15.5057 8.32077L20.397 9.03571C20.9121 9.11099 21.1696 9.14863 21.2888 9.27444C21.3925 9.38389 21.4412 9.5343 21.4215 9.68377C21.3988 9.85558 21.2124 10.0372 20.8395 10.4004L17.3014 13.8464C17.1912 13.9538 17.136 14.0076 17.1004 14.0715C17.0689 14.128 17.0487 14.1902 17.0409 14.2545C17.0321 14.3271 17.0451 14.403 17.0711 14.5547L17.906 19.4221C17.994 19.9355 18.038 20.1922 17.9553 20.3445C17.8833 20.477 17.7554 20.57 17.6071 20.5975C17.4366 20.6291 17.2061 20.5078 16.7451 20.2654L12.3724 17.9658C12.2361 17.8942 12.168 17.8584 12.0962 17.8443C12.0327 17.8318 11.9673 17.8318 11.9038 17.8443C11.832 17.8584 11.7639 17.8942 11.6277 17.9658L7.25492 20.2654C6.79392 20.5078 6.56341 20.6291 6.39297 20.5975C6.24468 20.57 6.11672 20.477 6.04474 20.3445C5.962 20.1922 6.00603 19.9355 6.09407 19.4221L6.92889 14.5547C6.95491 14.403 6.96793 14.3271 6.95912 14.2545C6.95132 14.1902 6.93111 14.128 6.89961 14.0715C6.86402 14.0076 6.80888 13.9538 6.69859 13.8464L3.16056 10.4004C2.78766 10.0372 2.60121 9.85558 2.57853 9.68377C2.55879 9.5343 2.60755 9.38389 2.71125 9.27444C2.83044 9.14863 3.08797 9.11099 3.60304 9.03571L8.49431 8.32077C8.64642 8.29854 8.72248 8.28742 8.78872 8.25662C8.84736 8.22935 8.90016 8.19096 8.94419 8.14358C8.99391 8.09006 9.02793 8.02113 9.09597 7.88328L11.2827 3.45332Z" 
        stroke="#000000" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const emit = defineEmits(['view-change', 'action']);

const props = defineProps({
  activeView: {
    type: String,
    default: 'kanban'
  },
  showFavorites: {
    type: Boolean,
    default: false
  }
});

const showFavorites = ref(props.showFavorites);

const toggleFavorites = () => {
  showFavorites.value = !showFavorites.value;
  emit('action', 'favorites', showFavorites.value);
};
</script>

<style scoped>
.view-icons-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  background: white;
  height: 44px;
  box-sizing: border-box;
}

.view-btn, 
.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #667085;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.view-btn:hover, 
.action-btn:hover {
  background: #F9FAFB;
}

.view-btn.active,
.action-btn.active {
  background: #F0F9FF;
  color: #0C66FF;
}

.vertical-divider {
  width: 1px;
  height: 1.25rem;
  background-color: #D0D5DD;
  margin: 0 0.125rem;
  flex-shrink: 0;
}

svg {
  display: block;
}
</style>
