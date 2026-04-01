/**
 * City database for smart location autocomplete
 * city → state/province → country with lat/lng for chart precision
 */

export interface CityEntry {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

// Major cities — expandable. Covers India, US, UK, Canada, Australia + more
export const CITIES: CityEntry[] = [
  // India — Andhra Pradesh
  { city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', lat: 16.5062, lng: 80.6480 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lng: 83.2185 },
  { city: 'Guntur', state: 'Andhra Pradesh', country: 'India', lat: 16.3067, lng: 80.4365 },
  { city: 'Nellore', state: 'Andhra Pradesh', country: 'India', lat: 14.4426, lng: 79.9865 },
  { city: 'Tirupati', state: 'Andhra Pradesh', country: 'India', lat: 13.6288, lng: 79.4192 },
  { city: 'Rajahmundry', state: 'Andhra Pradesh', country: 'India', lat: 17.0005, lng: 81.8040 },
  { city: 'Kakinada', state: 'Andhra Pradesh', country: 'India', lat: 16.9891, lng: 82.2475 },
  { city: 'Kurnool', state: 'Andhra Pradesh', country: 'India', lat: 15.8281, lng: 78.0373 },
  { city: 'Anantapur', state: 'Andhra Pradesh', country: 'India', lat: 14.6819, lng: 77.6006 },
  { city: 'Amaravati', state: 'Andhra Pradesh', country: 'India', lat: 16.5131, lng: 80.5150 },
  { city: 'Eluru', state: 'Andhra Pradesh', country: 'India', lat: 16.7107, lng: 81.0952 },
  { city: 'Ongole', state: 'Andhra Pradesh', country: 'India', lat: 15.5057, lng: 80.0499 },
  { city: 'Srikakulam', state: 'Andhra Pradesh', country: 'India', lat: 18.2949, lng: 83.8938 },
  { city: 'Kadapa', state: 'Andhra Pradesh', country: 'India', lat: 14.4674, lng: 78.8241 },
  // India — Telangana
  { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
  { city: 'Warangal', state: 'Telangana', country: 'India', lat: 17.9784, lng: 79.5941 },
  { city: 'Nizamabad', state: 'Telangana', country: 'India', lat: 18.6725, lng: 78.0941 },
  { city: 'Karimnagar', state: 'Telangana', country: 'India', lat: 18.4386, lng: 79.1288 },
  { city: 'Khammam', state: 'Telangana', country: 'India', lat: 17.2473, lng: 80.1514 },
  { city: 'Secunderabad', state: 'Telangana', country: 'India', lat: 17.4399, lng: 78.4983 },
  // India — Other major
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Delhi', state: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025 },
  { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { city: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 },
  { city: 'Chandigarh', state: 'Chandigarh', country: 'India', lat: 30.7333, lng: 76.7794 },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', lat: 23.2599, lng: 77.4126 },
  { city: 'Indore', state: 'Madhya Pradesh', country: 'India', lat: 22.7196, lng: 75.8577 },
  { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558 },
  { city: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lng: 78.1198 },
  { city: 'Kochi', state: 'Kerala', country: 'India', lat: 9.9312, lng: 76.2673 },
  { city: 'Thiruvananthapuram', state: 'Kerala', country: 'India', lat: 8.5241, lng: 76.9366 },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India', lat: 21.1458, lng: 79.0882 },
  { city: 'Patna', state: 'Bihar', country: 'India', lat: 25.6093, lng: 85.1376 },
  { city: 'Bhubaneswar', state: 'Odisha', country: 'India', lat: 20.2961, lng: 85.8245 },
  { city: 'Guwahati', state: 'Assam', country: 'India', lat: 26.1445, lng: 91.7362 },
  { city: 'Mysore', state: 'Karnataka', country: 'India', lat: 12.2958, lng: 76.6394 },
  { city: 'Mangalore', state: 'Karnataka', country: 'India', lat: 12.9141, lng: 74.8560 },
  { city: 'Surat', state: 'Gujarat', country: 'India', lat: 21.1702, lng: 72.8311 },
  { city: 'Vadodara', state: 'Gujarat', country: 'India', lat: 22.3072, lng: 73.1812 },
  // USA
  { city: 'New York', state: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', state: 'California', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago', state: 'Illinois', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston', state: 'Texas', country: 'USA', lat: 29.7604, lng: -95.3698 },
  { city: 'Dallas', state: 'Texas', country: 'USA', lat: 32.7767, lng: -96.7970 },
  { city: 'San Francisco', state: 'California', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'San Jose', state: 'California', country: 'USA', lat: 37.3382, lng: -121.8863 },
  { city: 'San Diego', state: 'California', country: 'USA', lat: 32.7157, lng: -117.1611 },
  { city: 'Austin', state: 'Texas', country: 'USA', lat: 30.2672, lng: -97.7431 },
  { city: 'Seattle', state: 'Washington', country: 'USA', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver', state: 'Colorado', country: 'USA', lat: 39.7392, lng: -104.9903 },
  { city: 'Boston', state: 'Massachusetts', country: 'USA', lat: 42.3601, lng: -71.0589 },
  { city: 'Miami', state: 'Florida', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { city: 'Atlanta', state: 'Georgia', country: 'USA', lat: 33.7490, lng: -84.3880 },
  { city: 'Phoenix', state: 'Arizona', country: 'USA', lat: 33.4484, lng: -112.0740 },
  { city: 'Portland', state: 'Oregon', country: 'USA', lat: 45.5152, lng: -122.6784 },
  { city: 'Washington', state: 'DC', country: 'USA', lat: 38.9072, lng: -77.0369 },
  { city: 'Philadelphia', state: 'Pennsylvania', country: 'USA', lat: 39.9526, lng: -75.1652 },
  { city: 'Minneapolis', state: 'Minnesota', country: 'USA', lat: 44.9778, lng: -93.2650 },
  { city: 'Charlotte', state: 'North Carolina', country: 'USA', lat: 35.2271, lng: -80.8431 },
  // UK
  { city: 'London', state: 'England', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Manchester', state: 'England', country: 'UK', lat: 53.4808, lng: -2.2426 },
  { city: 'Birmingham', state: 'England', country: 'UK', lat: 52.4862, lng: -1.8904 },
  { city: 'Edinburgh', state: 'Scotland', country: 'UK', lat: 55.9533, lng: -3.1883 },
  // Canada
  { city: 'Toronto', state: 'Ontario', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Vancouver', state: 'British Columbia', country: 'Canada', lat: 49.2827, lng: -123.1207 },
  { city: 'Montreal', state: 'Quebec', country: 'Canada', lat: 45.5017, lng: -73.5673 },
  // Australia
  { city: 'Sydney', state: 'New South Wales', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { city: 'Melbourne', state: 'Victoria', country: 'Australia', lat: -37.8136, lng: 144.9631 },
  // Middle East / UAE
  { city: 'Dubai', state: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lng: 54.3773 },
  // Singapore
  { city: 'Singapore', state: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  // Germany
  { city: 'Berlin', state: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { city: 'Munich', state: 'Bavaria', country: 'Germany', lat: 48.1351, lng: 11.5820 },
];

export function searchCities(query: string): CityEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return CITIES
    .filter((c) =>
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

export function formatCity(entry: CityEntry): string {
  return `${entry.city}, ${entry.state}, ${entry.country}`;
}
