import { useState } from "react";
import SubscriptionCard from "./components/SubscriptionCard";
import "./App.css";
import LoginPage from "./components/auth/login/loginPage";
import RegisterPage from "./components/auth/register/RegisterPage";

function App() {
  // const [subscriptions, setSubscriptions] = useState([
  //   {
  //     id: 1,
  //     name: "American Express",
  //     logo: "AE",
  //     dueDate: "Due in 7 days",
  //     price: "€12.00",
  //     billing: "Monthly",
  //   },
  // ]);

  // const handleEdit = (subscription) => {
  //   console.log("Edit subscription:", subscription);
  // };

  // const handleDelete = (subscription) => {
  //   console.log("Delete subscription:", subscription);

  //   // Optional: actually remove it from state
  //   setSubscriptions((prev) =>
  //     prev.filter((item) => item.id !== subscription.id)
  //   );
  // };

  return (
    // <div className="min-h-screen bg-black p-6">
    //   <div className="max-w-2xl mx-auto">
    //     <h1 className="text-white text-2xl font-bold mb-6">My Subscriptions</h1>

    //     <div className="space-y-3">
    //       {subscriptions.map((subscription) => (
    //         <SubscriptionCard
    //           key={subscription.id}
    //           subscription={subscription}
    //           onEdit={handleEdit}
    //           onDelete={handleDelete}
    //         />
    //       ))}
    //     </div>
    //   </div>
    // </div>
    // <LoginPage />
    <RegisterPage />
  );
}

export default App;
