import { computed, onBeforeUnmount, ref, watch } from 'vue'

export function useInfinitePager(options) {
  const {
    canAutoLoad,
    hasMore,
    isLoading,
    loadMore,
    maxAutoPages = 4,
  } = options

  const sentinelRef = ref(null)
  const autoLoads = ref(0)
  const observer = ref(null)

  const shouldShowManualButton = computed(() => hasMore.value && autoLoads.value >= maxAutoPages)
  const canObserve = computed(() => canAutoLoad.value && hasMore.value && !isLoading.value && !shouldShowManualButton.value)

  async function handleIntersect(entries) {
    const [entry] = entries

    if (!entry?.isIntersecting || !canObserve.value) {
      return
    }

    autoLoads.value += 1
    await loadMore()
  }

  function cleanupObserver() {
    observer.value?.disconnect()
    observer.value = null
  }

  function setupObserver() {
    cleanupObserver()

    if (!sentinelRef.value || !canObserve.value) {
      return
    }

    observer.value = new IntersectionObserver(handleIntersect, {
      rootMargin: '0px 0px 480px 0px',
      threshold: 0.01,
    })

    observer.value.observe(sentinelRef.value)
  }

  function resetAutoLoads() {
    autoLoads.value = 0
  }

  watch([sentinelRef, canObserve], setupObserver, { flush: 'post' })

  onBeforeUnmount(() => {
    cleanupObserver()
  })

  return {
    sentinelRef,
    autoLoads,
    shouldShowManualButton,
    resetAutoLoads,
  }
}
