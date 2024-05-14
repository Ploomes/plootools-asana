import { Form, Hostsets, Menu } from "@/components";
import { MemoryRouter, Route, Routes as Switch } from "react-router-dom";


function Routes() {
  return(
    <MemoryRouter>
      <main>
        <div className='container'>
          <Switch>
            <Route path="/" Component={Form} />
            <Route path="/hostset" Component={Hostsets} />
          </Switch>
        </div>
      </main>
    </MemoryRouter >
  );
};

export default Routes;