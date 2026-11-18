# PARTIE 1 – QCM Théorique (20 points)

> Une seule bonne réponse par question, sauf mention contraire.

## Navigation

### Q1. Dans React Navigation v6, quelle est la différence fondamentale entre `navigation.navigate()` et `navigation.push()` ?

- [ ] A) `navigate` remplace le stack, `push` ajoute toujours une nouvelle entrée
- [x] B) `navigate` ne fait rien si l'écran est déjà dans le stack, `push` ajoute toujours une nouvelle entrée
- [ ] C) `push` est réservé aux Stack Navigators, `navigate` fonctionne sur tous les navigators
- [ ] D) Il n'y a aucune différence depuis v6

### Q2. Comment partager un état global entre plusieurs navigateurs imbriqués (tabs + stack) sans prop drilling ?

- [ ] A) Utiliser `useRoute()` pour passer des paramètres entre navigators
- [x] B) Utiliser un state manager global (Redux, Zustand, Context) accessible depuis n'importe quel écran
- [ ] C) Utiliser `navigation.setParams()` depuis le navigateur parent
- [ ] D) Utiliser `React.createRef()` sur le `NavigationContainer`

### Q3. Quelle est la bonne façon de persister l'état de navigation dans React Navigation v6 ?

- [ ] A) Sauvegarder manuellement l'état dans `AsyncStorage` à chaque changement
- [ ] B) Utiliser la prop `initialState` du `NavigationContainer` avec un état stocké
- [ ] C) Utiliser `linking` config avec `getStateFromPath` et `getPathFromState`
- [x] D) Les props `onStateChange` + `initialState` du `NavigationContainer` combinées avec un storage

## State Management

### Q4. Quel est le rôle principal d'un reducer dans Redux ?

- [ ] A) Gérer les effets de bord comme les appels API
- [ ] B) Modifier directement le state global
- [x] C) Retourner un nouveau state en fonction d'une action reçue
- [ ] D) Dispatcher des actions vers le store

### Q5. Dans Redux Toolkit, à quoi sert `createAsyncThunk` et comment gérer ses états dans un slice ?

- [ ] A) C'est un hook qui remplace `useEffect` pour les appels API
- [ ] B) C'est un action creator asynchrone ; ses états se gèrent avec `extraReducers` via `builder.addCase()`
- [ ] C) Il faut créer manuellement trois actions séparées et les dispatcher dans un `useEffect`
- [ ] D) `createAsyncThunk` retourne directement les données, sans état intermédiaire

### Q6. Dans le flux de données Redux, quel est l'ordre correct des étapes ?

- [ ] A) Reducer → Dispatch → Store → UI
- [ ] B) UI → Reducer → Dispatch → Store
- [ ] C) UI → Dispatch → Middleware → Reducer → Store → UI
- [ ] D) Store → Reducer → Middleware → Dispatch → UI

### Q7. (Deux bonnes réponses) Quels sont les risques de sur-utilisation du Context API comme state manager global ?

- [x] A) Re-renders excessifs sur tous les consommateurs du context à chaque mise à jour
- [ ] B) Incompatibilité avec les hooks personnalisés
- [x] C) Problèmes de performance sur les listes longues si le context change fréquemment
- [ ] D) Le Context API ne fonctionne pas avec TypeScript

## API / Fetch / Async

### Q8. Quelle est la différence entre `useEffect` + `fetch` et React Query pour la gestion des appels API ?

- [ ] A) React Query ajoute uniquement une couche de cache
- [x] B) React Query gère automatiquement le cache, le refetch en arrière-plan, les états loading/error, la déduplication et le garbage collection
- [ ] C) `useEffect` est plus performant car il évite la surcouche de React Query
- [ ] D) React Query ne fonctionne pas avec React Native

### Q9. Comment gérer proprement l'annulation d'une requête `fetch` lorsqu'un composant est démonté ?

- [ ] A) Utiliser un flag `isMounted` et ignorer le résultat si le composant est démonté
- [x] B) Utiliser `AbortController` et passer le signal au `fetch`, puis appeler `abort()` dans le cleanup de `useEffect`
- [ ] C) Utiliser `clearTimeout` dans le cleanup de `useEffect`
- [ ] D) React Native annule automatiquement les requêtes en cours lors du démontage

### Q10. Dans une architecture offline-first, quelle stratégie est recommandée pour synchroniser les mutations locales avec le serveur ?

- [ ] A) Bloquer l'UI tant que la connexion n'est pas rétablie
- [x] B) Utiliser une queue de mutations persistée (ex : Redux Persist + middleware de sync), puis rejouer les actions à la reconnexion
- [ ] C) Utiliser uniquement `NetInfo` pour vérifier la connexion avant chaque appel
- [ ] D) Stocker les mutations dans le state local et les envoyer au prochain lancement de l'app

## UI/UX & Styling

### Q11. Quelle est la différence entre `StyleSheet.create()` et un objet de styles inline ?

- [ ] A) Aucune différence visible pour l'utilisateur
- [x] B) `StyleSheet.create()` valide les styles au build time et envoie les IDs au thread natif, réduisant les communications bridge
- [ ] C) Les styles inline sont plus performants car calculés directement dans le JS thread
- [ ] D) `StyleSheet.create()` est obligatoire pour que les animations fonctionnent

### Q12. Pour gérer les différences de safe area (notch, dynamic island, barre Android), quelle approche utilisez-vous ?

- [ ] A) Ajouter manuellement des paddings en dur avec `Platform.OS`
- [x] B) Utiliser `react-native-safe-area-context` avec `SafeAreaView` ou `useSafeAreaInsets()`
- [ ] C) Utiliser `StatusBar.currentHeight` uniquement
- [ ] D) La gestion est automatique depuis React Native 0.70

## Performance & Optimisation

### Q13. Deux différences majeures entre `FlatList` et `SectionList` — dans quel cas privilégier l'une ou l'autre ?

- [ ] A) `SectionList` est plus performante ; toujours la préférer
- [x] B) `FlatList` est pour les listes plates homogènes ; `SectionList` ajoute la notion de sections avec headers — à utiliser uniquement si les données sont groupées
- [ ] C) `FlatList` ne supporte pas `keyExtractor`
- [ ] D) Les deux sont identiques, seul le rendu visuel diffère

### Q14. Que fait `React.memo()` et dans quels cas son usage est-il contre-productif ?

- [x] A) Mémoïse le composant ; contre-productif si les props changent à chaque render (objets/fonctions inline)
- [ ] B) Équivaut à `useMemo()` pour les composants ; toujours bénéfique
- [ ] C) Empêche tous les re-renders ; contre-productif uniquement avec les Context
- [ ] D) Ne fonctionne qu'avec les class components

### Q15. Quelle est la différence entre `useCallback` et `useMemo` ?

- [ ] A) `useCallback` mémoïse une valeur ; `useMemo` mémoïse une fonction
- [x] B) `useCallback` mémoïse une fonction ; `useMemo` mémoïse le résultat d'un calcul — `useCallback(fn, deps)` équivaut à `useMemo(() => fn, deps)`
- [ ] C) Les deux sont identiques, seule la syntaxe diffère
- [ ] D) `useMemo` est réservé aux class components

### Q16. Qu'est-ce que le « JS thread » vs le « UI thread » et pourquoi est-ce critique pour les animations ?

- [x] A) Deux processus distincts ; le JS thread gère la logique, l'UI thread le rendu — les animations JS-side peuvent dropper des frames si le bridge est saturé
- [ ] B) Les deux threads sont synchronisés ; aucun risque de jank
- [ ] C) Depuis React Native 0.68, il n'y a plus de distinction
- [ ] D) Le JS thread est uniquement utilisé pour les calculs de layout

## Tests Unitaires

### Q17. Comment mocker un module natif (ex : `react-native-camera`) dans Jest ?

- [x] A) Créer un fichier `__mocks__/react-native-camera.js` ou utiliser `jest.mock('react-native-camera')`
- [ ] B) Utiliser `jest.spyOn()` directement sur le module natif
- [ ] C) Les modules natifs ne peuvent pas être mockés dans Jest
- [ ] D) Utiliser `jest.fn()` dans le fichier de test sans configuration supplémentaire

### Q18. Bonne pratique pour tester un composant avec appel API asynchrone dans React Testing Library ?

- [ ] A) Utiliser `setTimeout` pour attendre la réponse
- [x] B) Utiliser `waitFor()` ou `findBy*` qui attendent la mise à jour de l'UI de manière asynchrone
- [ ] C) Utiliser `act()` avec un `await` sur le `render`
- [ ] D) Mocker le module entier et tester uniquement le rendu synchrone

## Questions Transversales

### Q19. Qu'est-ce que Hermes et quel impact a-t-il sur les performances ?

- [x] A) Moteur JavaScript optimisé pour React Native : réduit le TTI, la consommation mémoire, active le bytecode précompilé
- [ ] B) Outil de debugging ; n'impacte pas les performances
- [ ] C) Remplace Flipper pour l'inspection réseau
- [ ] D) Activé uniquement en production

### Q20. Différence entre l'architecture « Paper » (legacy) et la « New Architecture » (Fabric + TurboModules) ?

- [x] A) La New Architecture supprime le bridge asynchrone au profit d'une communication synchrone JSI, réduisant la latence et permettant le rendu concurrent
- [ ] B) La New Architecture est uniquement cosmétique
- [ ] C) Fabric remplace uniquement Metro, le bu
