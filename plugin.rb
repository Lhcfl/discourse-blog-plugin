# frozen_string_literal: true

# name: discourse-blog
# about: Adds user blog to your Discourse instance
# version: 0.3
# authors: Lhc_fl
# url: https://github.com/paviliondev/discourse-blog

register_asset 'stylesheets/common/discourse-blog.scss'
register_asset 'stylesheets/mobile/discourse-blog.scss', :mobile

enabled_site_setting :discourse_blog_enabled

after_initialize do
  %w[
    ../lib/blog/engine.rb
    ../lib/blog/item.rb
    ../config/routes.rb
    ../app/controllers/blog_topics_controller.rb
  ].each do |path|
    load File.expand_path(path, __FILE__)
  end

  # add_to_class(:list_controller, :filter) do
  #   # def filter
  #     puts "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
      
  #     params[:action] = "filter"
  #     puts params
  #     puts filter_path "wert"
      
  #     puts "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"


  #     raise Discourse::NotFound if !SiteSetting.experimental_topics_filter
  
  #     topic_query_opts = { no_definitions: !SiteSetting.show_category_definitions_in_topic_lists }
  
  #     %i[page q].each do |key|
  #       if params.key?(key.to_s)
  #         value = params[key]
  #         raise Discourse::InvalidParameters.new(key) if !TopicQuery.validate?(key, value)
  #         topic_query_opts[key] = value
  #       end
  #     end
  
  #     user = list_target_user
  #     list = TopicQuery.new(user, topic_query_opts).list_filter
  #     list.more_topics_url = construct_url_with(:next, topic_query_opts)
  #     list.prev_topics_url = construct_url_with(:prev, topic_query_opts)
  
  #     respond_with_list(list)
  #   # end
    
  #   # respond_with_list(TopicQuery.new(current_user).list_blog params)
  # end

  add_to_serializer(:current_user, :blog_category_slugs) { SiteSetting.discourse_blog_category.split('|').map {|id| Category.find_by(id:).slug }.join(',') }
  add_to_class(:list_controller, :blog_path) do |text|
    puts filter_path text
    "/blog/#{params[:username]}#{(filter_path text)[7..]}"
  end
  add_to_class(:list_controller, :blog) do
    # def filter
      puts "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
      
      params[:q] = "categories:#{SiteSetting.discourse_blog_category.split('|').map {|id| Category.find_by(id:).slug }.join(',')} created-by:@#{params[:username]}"
      puts params
      action_name="filter"
      
      puts "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"

      result = filter
      puts result

      result
  end
  
  add_to_class(:topic_query, :list_blog) do |params|

    topics_filter = TopicsFilter.new(
      guardian: @guardian,
      scope: latest_results(include_muted: false, skip_ordering: true),
    )

    results = topics_filter.filter_from_query_string("categories:tea created-by:@#{params[:username]}")

    if !topics_filter.topic_notification_levels.include?(NotificationLevels.all[:muted])
      results = remove_muted_topics(results, @user)
    end

    results = apply_ordering(results) if results.order_values.empty?

    create_list(:filter, {}, results)
  end
end
