<template>
  <section class="about-us">
    <div class="about-us-content">
      <h2>ABOUT US</h2>
      <div class="about-us-grid">
        <div class="about-us-text">
          <p>
            Razz Rel Events is your premier event planning partner, dedicated to
            creating unforgettable moments for every occasion. With our passion
            for perfection and attention to detail, we transform your visions
            into reality.
          </p>
          <p>
            From weddings to corporate gatherings, our experienced team ensures
            that every aspect of your event is meticulously planned and
            flawlessly executed.
          </p>
          <p>
            Let us take the stress out of event planning and make your special
            day truly extraordinary. With Razz Rel Events, your dream event is
            just a conversation away.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Any necessary imports or logic
</script>

<style scoped>
.about-section {
  text-align: center;
  padding: 2rem;
}

.about-title {
  color: #FF6B6B; /* Keep the coral color for "ABOUT US" in both modes */
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.about-text {
  color: var(--text-color); /* This will adapt to dark/light mode */
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* Add these CSS variables to your root/main CSS file if not already present */
:root {
  --text-color: #333;
}

/* Dark mode specific styles */
:root.dark-mode {
  --text-color: #ffffff;
}

.services-section {
  padding: 2rem;
  text-align: center;
}

.services-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.service-title {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
}
</style>
