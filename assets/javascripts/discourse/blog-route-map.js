export default {
  resource: 'discovery',
  map() {
    this.route('blog', { path: '/blog/:username', resetNamespace: true });
    this.route('blog-topic', { path: '/blog/:username/t/:slug/:id', resetNamespace: true }, function() {
      this.route('blog-topic', { path: '/:postnumber' });
    });
  }
};
