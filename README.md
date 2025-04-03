# GA4 Audience Manager

This project is a GA4 Audience Manager that allows users to manage audiences, properties, and accounts using a React frontend and an Express backend.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v16 or higher)
- npm or yarn
- A Google Cloud service account with access to the Google Analytics Admin and Data APIs

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/ga4-audience-manager.git
cd ga4-audience-manager
```

### 2. Set Up the Backend

1. Navigate to the backend directory:

   ```bash
   cd backend-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add your Google Cloud service account credentials:

   - Create a service account in your Google Cloud project.
   - Download the JSON key file for the service account.
   - Save the JSON file in the `backend-app/resources` directory and name it `service-account.json`.

4. Create a `.env` file in the `backend-app` directory and add the following environment variables:

   ```env
   BACKEND_PORT=3001
   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
   ```

5. Start the backend server:

   ```bash
   npm start
   ```

   The backend server will run on `http://localhost:3001`.

### 3. Set Up the Frontend

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend-app` directory and add the following environment variables:

   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Start the frontend application:

   ```bash
   npm start
   ```

   The frontend application will run on `http://localhost:3000`.

## Usage

1. Open the frontend application in your browser at `http://localhost:3000`.
2. Use the interface to manage accounts, properties, and audiences.

## Project Structure

- `backend-app`: Contains the Express backend for handling API requests.
- `frontend-app`: Contains the React frontend for the user interface.

## Scripts

### Backend

- `npm start`: Starts the backend server.

### Frontend

- `npm start`: Starts the frontend development server.
- `npm run build`: Builds the frontend for production.

## License

This project is licensed under the MIT License.