# FoodShare Platform

A full-stack web application designed to connect food donors with receivers, effectively reducing food waste.

## Requirements
- Node.js installed
- MongoDB installed and running on `localhost:27017`

## Project Structure
- `backend/`: Node.js Express Server, Models, and APIs.
- `frontend/`: HTML, CSS, JavaScript UI.

## How to Run Locally

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd FoodShare/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Server:
   ```bash
   npm start
   ```
   > The server will start on `http://localhost:5000`

### 2. Run Frontend
The frontend consists of static HTML/JS/CSS files.
1. Open `FoodShare/frontend/index.html` using a web browser.
2. OR, for a better experience, serve the directory using a tool like Live Server or Python's `http.server`:
   ```bash
   cd FoodShare/frontend
   python -m http.server 8000
   ```
3. Navigate to `http://localhost:8000` in your browser.

## Database Schema (MongoDB / Mongoose)
- **User**: `name`, `email`, `password`, `role` (Donor, Receiver, Admin)
- **Donation**: `donor_id`, `food_name`, `quantity`, `expiry_date`, `address`, `qr_code`, `status`
- **Claim**: `donation_id`, `receiver_id`, `status`

## Example Queries (Mongoose equivalent)
- **Find all pending donations:**
  ```javascript
  Donation.find({ status: 'Pending' }).populate('donor_id', ['name'])
  ```
- **Find claims by receiver:**
  ```javascript
  Claim.find({ receiver_id: "USER_ID" })
  ```
- **Update donation status to Claimed:**
  ```javascript
  Donation.findByIdAndUpdate("DONATION_ID", { status: 'Claimed' })
  ```
