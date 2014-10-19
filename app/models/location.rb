class Location < ActiveRecord::Base

	has_ancestry
  validates :name, :uniqueness => true
  
	geocoded_by :full_address 
	after_validation :geocode, :if => :name_changed?
  
  
  def self.route_steps(origin, destination)
    result = fetch_route_from_google("driving", origin, destination)
    # if result.size < 8
#       result = fetch_route_from_google("walking", origin, destination)
#     end
    return result.collect{|step| step["end_location"]}
  end
  
  def self.fetch_route_from_google(mode, origin, destination)
    request = Net::HTTP.get(URI.parse("https://maps.googleapis.com/maps/api/directions/json?origin=#{origin.latitude},#{origin.longitude}&destination=#{destination.latitude},#{destination.longitude}&key=#{GOOGLE_API_KEY}&mode=#{mode}"))
    hash = JSON.parse request
    return hash["routes"] && hash["routes"].first.present? ? hash["routes"].first["legs"].first["steps"] : hash["routes"]
  end
  
  def full_address
    name.concat(" #{city}")
  end
  
end
