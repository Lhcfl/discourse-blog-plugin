# frozen_string_literal: true

class BlogTopicsController < ::TopicsController
  def blog_show
    params[:controller] = "topics"
    show  
  end
  def redirect_to_correct_topic(topic, post_number = nil)
    begin
      guardian.ensure_can_see!(topic)
    rescue Discourse::InvalidAccess => ex
      raise(SiteSetting.detailed_404 ? ex : Discourse::NotFound)
    end

    author = User.find_by(id: topic.user_id)

    url = "/blog/#{author.username}" + topic.relative_url[2..]
    url << "/#{post_number}" if post_number.to_i > 0
    url << ".json" if request.format.json?

    redirect_to url, status: 301
  end
end