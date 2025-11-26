import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import MyPet from './pages/MyPet'
import Battle from './pages/Battle'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/my-pet',
    element: <MyPet />
  },
  {
    path: '/battle',
    element: <Battle />
  },
  {
    path: '/leaderboard',
    element: <Leaderboard />
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '*',
    element: <NotFound />
  }
])

export default router