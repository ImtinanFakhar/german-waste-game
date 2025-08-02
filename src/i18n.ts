import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translation resources directly
const resources = {
  en: {
    translation: {
      title: "German Waste Sorting Game",
      select_city: "Select a City",
      start_game: "Start Game",
      score: "Score",
      fines: "Fines",
      round: "Round",
      throw_away: "Throw Away",
      correct: "Correct",
      wrong: "Wrong",
      of: "of",
      next_item: "Next Item",
      restart_game: "Restart Game",
      share_results: "Share Results",
      tweet_results: "I scored {{score}} points in the German Waste Sorting Game! Can you beat my score? #GermanWasteGame #Recycling",
      game_over: "Game Over",
      final_score: "Final Score",
      total_fines: "Total Fines",
      accuracy: "Accuracy",
      feedback_success_base: "Correct! You earned",
      feedback_success_streak: "points. Streak x{{streak}}!",
      feedback_error: "Oops! That's not the right bin. You've been fined",
      points: "points",
      city_info: "In {{city}}, the waste is managed by {{authority}}.",
      bin_info: "This is the {{binName}}.",
      welcome: "Welcome to the German Waste Sorting Game!",
      instructions: "Select a city to learn about its waste sorting rules. Then, start the game and drag the trash items to the correct bins.",
      sound_on: "Sound On",
      sound_off: "Sound Off"
    }
  },
  de: {
    translation: {
      title: "Deutsches Müllsortier-Spiel",
      select_city: "Wähle eine Stadt",
      start_game: "Spiel starten",
      score: "Punkte",
      fines: "Bußgelder",
      round: "Runde",
      throw_away: "Wegwerfen",
      correct: "Richtig",
      wrong: "Falsch",
      of: "von",
      next_item: "Nächster Gegenstand",
      restart_game: "Spiel neustarten",
      share_results: "Ergebnisse teilen",
      tweet_results: "Ich habe {{score}} Punkte im Deutschen Müllsortier-Spiel erzielt! Kannst du mein Ergebnis übertreffen? #GermanWasteGame #Recycling",
      game_over: "Spiel beendet",
      final_score: "Endstand",
      total_fines: "Gesamte Bußgelder",
      accuracy: "Genauigkeit",
      feedback_success_base: "Richtig! Du hast",
      feedback_success_streak: "Punkte erhalten. Serie x{{streak}}!",
      feedback_error: "Hoppla! Das ist nicht der richtige Behälter. Du hast eine Geldstrafe von",
      points: "Punkte",
      city_info: "In {{city}} wird der Müll von {{authority}} verwaltet.",
      bin_info: "Dies ist der {{binName}}.",
      welcome: "Willkommen beim Deutschen Müllsortier-Spiel!",
      instructions: "Wähle eine Stadt, um deren Müllsortierregeln zu lernen. Starte dann das Spiel und ziehe die Müllgegenstände in die richtigen Behälter.",
      sound_on: "Ton an",
      sound_off: "Ton aus"
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    lng: 'en', // default language
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
  });

export default i18next;
