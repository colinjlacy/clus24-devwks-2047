import React from 'react';
import './App.css';
import BasicTabs from "./layouts/navigation";
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import {Main} from "./components/main";
import Section1 from "./components/section1";
import section1 from './lab-guide/section1.md'
import Section2 from "./components/section2";
import section2 from './lab-guide/section2.md'
import Section3 from "./components/section3";
import section3 from './lab-guide/section3.md'
import Section4 from "./components/section4";
import section4 from './lab-guide/section4.md'
import Section5 from "./components/section5";
import section5 from './lab-guide/section5.md'
import ReaderLayout from "./layouts/reader-layout";
import SectionLayout from "./layouts/section-layout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Main></Main>,
        children: [
            {
                index: true,
                element: <ReaderLayout mdPath={section1}></ReaderLayout>
            },
            {
                path: "section-2",
                element: <SectionLayout component={<Section2 />} mdPath={section2}></SectionLayout>
            },
            {
                path: "section-3",
                element: <SectionLayout component={<Section3 />} mdPath={section3}></SectionLayout>,
            },
            {
                path: "section-4",
                element: <SectionLayout component={<Section4 />} mdPath={section4}></SectionLayout>,
            },
            {
                path: "section-5",
                element: <SectionLayout component={<Section5 />} mdPath={section5}></SectionLayout>,
            }
        ]
    },
], {basename: "/"});

function App() {


    return (
    <div className="App">
      {/*<header className="App-header">*/}
      {/*  <Main></Main>*/}
      {/*</header>*/}
        <RouterProvider router={router}/>
    </div>
  );
}

export default App;
