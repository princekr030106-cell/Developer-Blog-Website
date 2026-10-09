# 📝 Developer Blog Website

A modern **Developer Blog Website** where users can create, manage, and read blog articles. The project is built using a React frontend and a Node.js/Express backend with a database for storing users, blogs, categories, and other application data.

## 🚀 Features

* 🔐 User authentication and authorization
* 📝 Create, edit, and delete blog posts
* 📖 Read and view blog articles
* 🏷️ Blog categories and tags
* 🖼️ Upload featured images for blogs
* 🔍 Browse blogs by category
* 👤 User management
* 🌐 REST API integration
* 📱 Responsive design for mobile, tablet, and desktop
* 🔒 Environment variables for sensitive information
* ☁️ Image/media upload support

## 🛠️ Technologies Used

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* REST API

### Other Tools

* Git & GitHub
* Postman
* Cloudinary

## 📂 Project Structure

```text
Blog/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── blog-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/princekr030106-cell/Developer-Blog-Website.git
```

Move into the project directory:

```bash
cd Blog
```

---

## 🔧 Backend Setup

Open the Backend folder:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the Backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:

```bash
npm start
```

For development, if you have Nodemon configured:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

## 💻 Frontend Setup

Open another terminal and move into the Frontend folder:

```bash
cd blog-frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend will normally run on:

```text
http://localhost:3000
```

If you are using Vite, use:

```bash
npm run dev
```

The application will normally run on:

```text
http://localhost:5173
```

## 🔐 Environment Variables

Sensitive information should **never be uploaded to GitHub**.

Add the following to `.gitignore`:

```gitignore
node_modules/
.env
.env.local
dist/
build/
```

Example:

```text
Backend/
└── .env
```

The `.env` file should remain local.

## 🔌 API

The backend provides REST APIs for operations such as:

```text
Authentication
Blogs
Categories
Users
Image Uploads
```

Example API structure:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/blog
GET    /api/blog/:id
POST   /api/blog
PUT    /api/blog/:id
DELETE /api/blog/:id
```

> API routes may vary depending on the final implementation of the project.

## 🖼️ Image Upload

The application supports uploading images for blog posts.

Images can be uploaded through the backend using **Multer** and can be stored using **Cloudinary**.

Make sure the required Cloudinary credentials are added to your `.env` file.

## 🧪 Testing

You can test the backend APIs using **Postman**.

For example:

```text
Register User
      ↓
Login User
      ↓
Receive Authentication Token
      ↓
Create Blog
      ↓
Upload Featured Image
      ↓
View Blog
      ↓
Update / Delete Blog
```

## 📱 Responsive Design

The frontend is designed to work across:

* 📱 Mobile devices
* 📲 Tablets
* 💻 Laptops
* 🖥️ Desktop computers

## 🔒 Security

The project follows basic security practices such as:

* Password authentication
* JWT-based authorization
* Protected API routes
* Environment variables for secrets
* `.gitignore` for sensitive files
* Server-side validation

## 📸 Screenshots

Add screenshots of your application here.

Example:

```markdown
![Home Page](./screenshots/home.png)

![Blog Page](./screenshots/blog.png)

![Login Page](./screenshots/login.png)
```

## 🔮 Future Improvements

Some possible future improvements include:

* 💬 Comments and replies
* ❤️ Like and bookmark functionality
* 🔎 Advanced blog search
* 👤 User profile pages
* 📊 Admin dashboard
* 🔔 Notifications
* 🌙 Dark mode
* 📈 Blog analytics
* 🚀 Deployment with a production database

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add new feature"
```

5. Push the branch

```bash
git push origin feature/new-feature
```

6. Create a Pull Request

## 📄 License

This project is created for learning and development purposes.

## 👨‍💻 Author

**Your Name**

GitHub: `https://github.com/your-username`

---

⭐ If you found this project useful, consider giving the repository a star!
