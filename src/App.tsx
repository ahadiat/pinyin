import { Routes, Route } from "react-router-dom";
import WordList from "./pages/Study";
import WordDetail from "./pages/Studyt";
import Home from "./pages/Home";
import Studyhome from "./pages/Study_Home";
import StartLearning from "./pages/Nouns";
import ContactForm from "./pages/test";
import LessonComplete from "./pages/Congrats";
import AddWord from "../components/addWord"
import VoiceAI from "./pages/VoiceAI";


export default function App() {
  return (
    <Routes>
      {/* Homepage */}

      <Route path="/" element={<Home />} />
      <Route path="/pinyin" element={<WordList />} />
      <Route path="/Studyhome" element={<Studyhome />} />
      <Route path="/start/:category" element={<StartLearning />} />
      <Route path="/test" element={<ContactForm />} />
      <Route path="/congrats" element={<LessonComplete />} />
      <Route path="/addword" element={<AddWord/>} />
      <Route path="/pinyinai" element={<VoiceAI/>} />
      
 

      {/* Dynamic word page */}
      <Route path="/word/:id" element={<WordDetail />} />
    </Routes>
  );
}

