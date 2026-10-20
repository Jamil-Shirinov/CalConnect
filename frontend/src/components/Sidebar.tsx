import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Find a Tutor", path: "/tutors" },
  { name: "My Matches", path: "/matches" },
  { name: "Sessions", path: "/sessions" },
  { name: "Messages", path: "/messages" },
  { name: "Study Plans", path: "/study-plans" },
  { name: "Profile", path: "/profile" },
  { name: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        CalConnect
      </div>

      <nav>
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}