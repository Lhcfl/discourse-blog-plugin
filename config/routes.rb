Discourse::Application.routes.prepend do
  get 'blog/:username' => 'list#blog'
  get 'blog/:username/t/:slug/:id' => 'blog_topics#blog_show'
  get 'blog/:username/t/:slug/:id/:postnumber' => 'blog_topics#blog_show'
end