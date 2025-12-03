# scan2eat - Ingredient Analyzer

A web application that allows users to search for food products and analyze their ingredients, nutritional information, allergens, and additives using the Open Food Facts API.

## Features

- Search products by name or barcode
- View detailed ingredient lists
- Analyze nutritional information per 100g
- Identify allergens and food additives
- Check product labels and certifications
- Sort results by name or Nutri-Score
- Filter products in real-time
- Responsive design for mobile and desktop

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Open Food Facts API

## API Information

This application uses the Open Food Facts API, a free and open database of food products from around the world.

- API Documentation: https://world.openfoodfacts.org/data
- No API key required
- Rate limit: Please be reasonable with requests
- Data License: Open Database License (ODbL)

## Running Locally

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd nutriscan
```

2. Ensure your directory structure looks like this:
```
scan2eat
├── index.html

│   └── style.css

│   └── app.js
├── .gitignore
└── README.md
```

### Running with a Local Server

#### Option 1: Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open http://localhost:8000 in your browser.

#### Option 2: Using Node.js
```bash
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

#### Option 3: Using VS Code
Install the "Live Server" extension and right-click on index.html, then select "Open with Live Server".

## Deployment Instructions

### Server Requirements

- Web server capable of serving static files (Apache, Nginx, etc.)
- No server-side processing required

### Deploying to Web Servers

#### Step 1: Prepare the Application

1. Ensure all files are in the correct structure
2. Test the application locally before deployment
3. Verify all paths are relative (no absolute paths)

#### Step 2: Deploy to Web01 and Web02

1. Connect to your server via SSH:
```bash
ssh user@web01-ip-address
```

2. Navigate to the web root directory:
```bash
cd /var/www/html
```

3. Create a directory for the application:
```bash
sudo mkdir -p scan2eat
```

4. Upload files using SCP:
```bash
scp -r /local/path/to/scan2eat/* user@web01-ip:/var/www/html/scan2eat/
```

Or use SFTP or rsync:
```bash
rsync -avz /local/path/to/scan2eat/ user@web01-ip:/var/www/html/scan2eat/
```

5. Set correct permissions:
```bash
sudo chown -R www-data:www-data /var/www/html/scan2eat
sudo chmod -R 755 /var/www/html/scan2eat
```

6. Repeat steps 1-5 for Web02

#### Step 3: Configure Load Balancer (Lb01)

1. Connect to the load balancer:
```bash
ssh user@lb01-ip-address
```

2. Edit the HAProxy configuration:
```bash
sudo nano /etc/haproxy/haproxy.cfg
```

3. Add the following configuration:
```
frontend nutriscan_frontend
    bind *:80
    default_backend nutriscan_backend

backend nutriscan_backend
    balance roundrobin
    option httpchk GET /nutriscan/
    server web01 <web01-ip>:80 check
    server web02 <web02-ip>:80 check
```

4. Test the configuration:
```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
```

5. Restart HAProxy:
```bash
sudo systemctl restart haproxy
```

6. Verify the load balancer status:
```bash
sudo systemctl status haproxy
```

#### Step 4: Testing the Deployment

1. Access the application via the load balancer:
```
http://<lb01-ip>/nutriscan/
```

2. Test multiple requests to ensure traffic is distributed between Web01 and Web02

3. Check load balancer statistics (if enabled):
```
http://<lb01-ip>:8080/stats
```

4. Verify both servers are marked as "UP" in the statistics page

5. Test failover by stopping one web server and confirming the application still works

## Usage Guide

1. Enter a product name or barcode in the search box
2. Click the "Search" button or press Enter
3. Browse through the search results
4. Use the sort dropdown to organize results by name or Nutri-Score
5. Use the filter input to narrow down results
6. Click on any product card to view detailed information
7. Click "Back to Results" to return to the search results

## Features Explained

### Search Functionality
Search for any food product by name or barcode. The application queries the Open Food Facts database and returns up to 20 results.

### Sorting Options
- Relevance: Default order from the API
- Name (A-Z): Alphabetical ascending
- Name (Z-A): Alphabetical descending
- Nutri-Score: Health score from A (best) to E (worst)

### Filtering
Real-time filtering of search results by product name or brand.

### Product Details
Detailed view includes:
- Product image
- Brand and quantity information
- Nutri-Score rating
- Complete ingredient list
- Allergen information
- Nutritional facts per 100g
- Food additives
- Labels and certifications

## Error Handling

The application includes comprehensive error handling for:
- Network failures
- API downtime
- Invalid search queries
- Missing product data
- Image loading failures

## Challenges Faced

### Challenge 1: API Rate Limiting
The Open Food Facts API has no strict rate limits, but we implemented request throttling to be respectful of their resources.

### Challenge 2: Inconsistent Data
Not all products in the database have complete information. We handled this by checking for the existence of each field before displaying it and providing fallback values.

### Challenge 3: Image Loading
Some product images are missing or broken. We implemented error handling on images to display placeholder images when necessary.

### Challenge 4: Cross-Origin Requests
Initially tested the API to ensure CORS headers were properly set. The Open Food Facts API supports CORS, which allowed us to make requests directly from the browser.

## Credits

- **API Provider**: Open Food Facts (https://world.openfoodfacts.org)
- **Data Contributors**: Open Food Facts community contributors worldwide
- **License**: Data licensed under the Open Database License (ODbL)

## Future Enhancements

- Barcode scanning using device camera
- User accounts for saving favorite products
- Comparison feature for multiple products
- Nutritional recommendations based on dietary needs
- Export functionality for product data

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is for educational purposes as part of a web development assignment.

## Contact


For questions or issues, please open an issue in the GitHub repository.

Link to web app: http://13.218.204.67/
Link to the demo video: https://youtu.be/H9yXHJkc18o

