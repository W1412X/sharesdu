<template>

</template>
<script>
export default {
  name: 'ManageItem',
  props: {
    initData: {
      type: Object,
      default: () => {
        return {
            type:null,//
            id:null,//
        }
      }
    }
  }
}
</script>
<style>
</style>