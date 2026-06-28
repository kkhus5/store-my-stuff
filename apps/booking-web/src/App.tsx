import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Reservation } from "./screens/Reservation";
import { StoreSelection } from "./screens/StoreSelection";
import { Header } from "./shared/Header";

export function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<StoreSelection />} />
                        <Route
                            path="/stores/:storeId/reserve"
                            element={<Reservation />}
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
