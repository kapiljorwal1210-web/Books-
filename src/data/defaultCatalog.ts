import { Book } from '../types/book';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'gutenberg_gitanjali',
    title: 'Gitanjali (Song Offerings)',
    author: 'Rabindranath Tagore',
    category: 'Poetry',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'A collection of 103 inspirational poems by Nobel laureate Rabindranath Tagore, exploring divine love, devotion, nature, and the human spirit.',
    language: 'en',
    downloadUrl: 'https://www.gutenberg.org/ebooks/7164.txt.utf-8',
    isDownloaded: true,
    downloadDate: Date.now() - 86400000 * 2,
    lastReadTimestamp: Date.now() - 3600000,
    lastReadPage: 8,
    totalPages: 24,
    totalReadingTimeSeconds: 1560, // ~26 mins read
    readingSessionsCount: 4,
    isFavorite: true,
    fileSizeBytes: 48500,
    contentPreview: 'Thou hast made me endless, such is thy pleasure. This frail vessel thou emptiest again and again, and fillest it ever with fresh life...',
    fullContent: `GITANJALI (SONG OFFERINGS)
By Rabindranath Tagore
Nobel Prize in Literature 1913

--- POEM 1 ---
Thou hast made me endless, such is thy pleasure. This frail vessel thou emptiest again and again, and fillest it ever with fresh life.
This little flute of a reed thou hast carried over hills and dales, and hast breathed through it melodies eternally new.
At the immortal touch of thy hands my little heart loses its limits in joy and gives birth to utterance ineffable.
Thy infinite gifts come to me only on these very small hands of mine. Ages pass, and still thou pourest, and still there is room to fill.

--- POEM 2 ---
When thou commandest me to sing it seems that my heart would break with pride; and I look to thy face, and tears come to my eyes.
All that is harsh and dissonant in my life melts into one sweet harmony—and my adoration spreads wings like a glad bird on its flight across the sea.
I know thou takest pleasure in my singing. I know that only as a singer I come before thy presence.
I touch by the edge of the far-spreading wing of my song thy feet which I could never aspire to reach.
Drunk with the joy of singing I forget myself and call thee friend who art my lord.

--- POEM 3 ---
I know not how thou singest, my master! I ever listen in silent amazement.
The light of thy music illumines the world. The life breath of thy music runs from sky to sky. The holy stream of thy music breaks through all stony obstacles and rushes on.
My heart longs to join in thy song, but vainly struggles for a voice. I would speak, but speech breaks not into song, and I cry out baffled. Ah, thou hast made my heart captive in the endless meshes of thy music, my master!

--- POEM 4 ---
Life of my life, I shall ever try to keep my body pure, knowing that thy living touch is upon all my limbs.
I shall ever try to keep all untruths out from my thoughts, knowing that thou art that truth which has kindled the light of reason in my mind.
I shall ever try to drive all evils away from my heart and keep my love in flower, knowing that thou hast thy seat in the inmost shrine of my heart.
And it shall be my endeavour to reveal thee in my actions, knowing it is thy power gives me strength to act.

--- POEM 35 ---
Where the mind is without fear and the head is held high;
Where knowledge is free;
Where the world has not been broken up into fragments by narrow domestic walls;
Where words come out from the depth of truth;
Where tireless striving stretches its arms towards perfection;
Where the clear stream of reason has not lost its way into the dreary desert sand of dead habit;
Where the mind is led forward by thee into ever-widening thought and action—
Into that heaven of freedom, my Father, let my country awake.

--- POEM 50 ---
I had gone a-begging from door to door in the village path, when thy golden chariot appeared in the distance like a gorgeous dream and I wondered who was this King of all kings!
My hopes rose high and methought my evil days were at an end, and I stood waiting for alms to be given unasked and for wealth scattered on all sides in the dust.
The chariot stopped where I stood. Thy glance fell on me and thou camest down with a smile. I felt that the luck of my life had come at last. Then of a sudden thou didst hold out thy right hand and say 'What hast thou to give to me?'
Ah, what a kingly jest it was to open thy palm to a beggar to beg! I was confused and stood undecided, and then from my wallet I slowly took out the least little grain of corn and gave it to thee.
But how great my surprise when at the day's end I emptied my bag on the floor to find a least little grain of gold among the poor heap! I bitterly wept and wished that I had had the heart to give thee my all.`
  },
  {
    id: 'gutenberg_premchand_idgah',
    title: 'Idgah and Selected Masterpieces',
    author: 'Munshi Premchand',
    category: 'Hindi Classics',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    description: 'The immortal story of young Hamid, his grandmother Ameena, love, sacrifice, and the festival of Eid, alongside Premchand\'s greatest short works.',
    language: 'en',
    downloadUrl: undefined,
    isDownloaded: true,
    downloadDate: Date.now() - 86400000 * 3,
    lastReadTimestamp: Date.now() - 7200000,
    lastReadPage: 18,
    totalPages: 18,
    totalReadingTimeSeconds: 2160, // 36 mins (100% Completed)
    readingSessionsCount: 5,
    isFavorite: true,
    fileSizeBytes: 36000,
    contentPreview: 'A full thirty days of Ramadan had passed, and today was Eid. How lovely, how bright was the morning! The trees seemed greener, the fields more festive...',
    fullContent: `IDGAH AND SELECTED STORIES
By Munshi Premchand

--- CHAPTER 1: THE MORNING OF EID ---
A full thirty days of Ramadan had passed, and today was Eid. How lovely, how radiant was the morning! The sun seemed warmer and had a gentle orange glow, as though it were congratulating the world on the joyous festival. The trees in the orchard looked greener, the breeze smelled of roasted sesame and sweet syrup, and the village was bustling with uncontainable excitement.

Everyone was preparing to go to the Idgah prayer ground. Boys ran in and out of the mud houses, checking their kurtas and pockets. Most delighted of all was little Hamid. He was only four or five years old, frail, dark-eyed, and poorly clad. His father had died the previous year of cholera, and his mother had slowly withered away with grief until one morning she too never woke up.

Now Hamid lived with his aged grandmother, Ameena, and slept peacefully in her lap. He believed his father had gone to earn silver rupees and would return with sackfuls of coins, and that his mother had gone to Allah to bring back beautiful toys for him. This innocent belief gave him infinite joy and kept melancholy far away.

--- CHAPTER 2: THE JOURNEY TO THE IDGAH ---
Hamid had no shoes on his feet. On his head was a faded, tattered cap whose golden lace had turned black. Yet he was happier than all the well-dressed children of the village. Ameena sat in her dim hut, weeping silently. It was Eid, and there was not a grain of food in the hearth. If only her son were alive!

Hamid ran inside and said reassuringly, "Ammi, do not worry. I will be the very first to return from the fair. Have no fear at all!"
Ameena's heart sank, but she gave him three copper paise—all the savings she had in the whole world.

The children set off together down the dusty village path, past fragrant mango orchards and wide green fields. When they saw the grand white minarets of the town mosques in the distance, their steps quickened.

--- CHAPTER 3: THE FAIR AND THE TOYS ---
At the Idgah, thousands of worshippers stood shoulder to shoulder in perfect rows, bowing and prostrating simultaneously with graceful harmony. When prayers ended, the worshippers embraced one another and rushed toward the colorful village fair.

There were swinging roundabouts, sweet stalls glistening with golden jalebis and gulab jamuns, and stalls filled with painted clay toys: brave soldiers with red turbans, water-bearers, milkmaids, and lawyers in black coats.

Hamid's friends—Mahmood, Mohsin, and Noorey—spent two paise each on fine clay toys and rode the merry-go-round. Hamid stood at a distance, watching them. He held his three precious paise tight in his palm. "Clay toys will shatter if dropped on the ground," he told himself. "Why squander hard-earned money on things that last only moments?"

--- CHAPTER 4: THE PAIR OF TONGS ---
Walking past the sweets vendors, Hamid noticed an ironsmith's shop. On a wooden plank lay iron spoons, sieves, and several pairs of chimney tongs (chimta).
Suddenly, Hamid's mind rushed to his grandmother. Whenever Ameena baked rotis over the open flame, she burned her bare fingers because they had no tongs. If he bought this chimta and gave it to her, how pleased she would be! Her fingers would never blister again.

Hamid asked the smith, "How much for this chimta?"
"Six paise," replied the blacksmith indifferently.
Hamid's heart sank, but he summoned his courage. "Will you take three paise?"
He turned to walk away, fearful the smith might scold him. But the smith called him back and placed the sturdy iron chimta in his hands!

--- CHAPTER 5: THE TRIUMPH ---
Hamid slung the tongs proudly over his shoulder like a rifle and strode triumphantly back to his companions.
"Why did you buy tongs, you fool?" mocked Mahmood. "What will you do with it?"
Hamid held the tongs high. "Place it on my shoulder, it is a gun! Carry it in my hand, it is the musical tongs of an ascetic! If I strike your fragile clay toys with one blow, their ribs will shatter into dust, while my chimta is made of steel—a tiger among toys that neither fire nor flood can harm!"
The boys were stunned by Hamid's eloquence. None of their fragile toys could equal the unshakeable bravery of the iron tongs.

--- CHAPTER 6: AMEENA'S TEARS ---
When Hamid reached home, Ameena rushed to gather him in her embrace. Then her eyes fell on the iron tongs.
"Where did you get this chimta?" she asked sternly.
"I bought it at the fair for three paise," Hamid said softly.
Ameena beat her breast in sorrow. "What an unlucky child! All morning you had neither food nor drink, and of all things at the fair, you spent your only coins on a piece of iron!"

Hamid lowered his eyes and whispered with tender love, "Every day your fingers burn when you turn the rotis on the tawa. I bought it so your hands would never hurt again."

Ameena froze. Her anger vanished in an instant, replaced by a surge of overwhelming tenderness. How deep was this child's sacrifice! While other children feasted on sweets and played with dazzling toys, Hamid had thought only of his grandmother's scorched hands.
Tears streamed down her wrinkled cheeks as she held the little boy close, praying to the Heavens to shower blessings on Hamid, while Hamid stood in wonder, holding his precious gift of love.`
  },
  {
    id: 'gutenberg_1342',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    category: 'Classic Fiction',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    description: 'Jane Austen\'s witty masterpiece about Elizabeth Bennet and Mr. Darcy, navigating pride, societal expectations, family, and true love in 19th-century England.',
    language: 'en',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1342.txt.utf-8',
    isDownloaded: true,
    downloadDate: Date.now() - 86400000 * 5,
    lastReadTimestamp: Date.now() - 86400000,
    lastReadPage: 15,
    totalPages: 61,
    totalReadingTimeSeconds: 1920, // 32 mins
    readingSessionsCount: 3,
    isFavorite: false,
    fileSizeBytes: 72000,
    contentPreview: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife...',
    fullContent: `PRIDE AND PREJUDICE
By Jane Austen

--- CHAPTER 1 ---
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"
Mr. Bennet replied that he had not.
"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."
Mr. Bennet made no answer.
"Do you not want to know who has taken it?" cried his wife impatiently.
"You want to tell me, and I have no objection to hearing it."
This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."
"What is his name?"
"Bingley."
"Is he married or single?"
"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"
"How so? How can it affect them?"
"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."`
  },
  {
    id: 'gutenberg_1661',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    category: 'Mystery & Detective',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    description: 'Twelve thrilling cases of the world\'s most famous consulting detective, Sherlock Holmes, and his companion Dr. John Watson in Victorian London.',
    language: 'en',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1661.txt.utf-8',
    isDownloaded: false,
    lastReadTimestamp: 0,
    lastReadPage: 1,
    totalPages: 45,
    totalReadingTimeSeconds: 0,
    readingSessionsCount: 0,
    isFavorite: true,
    fileSizeBytes: 58000,
    contentPreview: 'To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name...',
    fullContent: `THE ADVENTURES OF SHERLOCK HOLMES
By Arthur Conan Doyle

--- I. A SCANDAL IN BOHEMIA ---
To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position.

One night—it was on the twentieth of March, 1888—I was returning from a journey to a patient, when my way led me through Baker Street. As I passed the well-remembered door, which must always be associated in my mind with my wooing, and with the dark incidents of the Study in Scarlet, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers.`
  },
  {
    id: 'gutenberg_meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80',
    description: 'Personal journals of Roman Emperor Marcus Aurelius on Stoic philosophy, resilience, duty, mindfulness, and mastering the inner citadel.',
    language: 'en',
    downloadUrl: 'https://www.gutenberg.org/ebooks/2680.txt.utf-8',
    isDownloaded: false,
    lastReadTimestamp: 0,
    lastReadPage: 1,
    totalPages: 32,
    totalReadingTimeSeconds: 0,
    readingSessionsCount: 0,
    isFavorite: false,
    fileSizeBytes: 42000,
    contentPreview: 'When you arise in the morning think of what a privilege it is to be alive: to think, to enjoy, to love...',
    fullContent: `MEDITATIONS
By Marcus Aurelius Antoninus

--- BOOK TWO ---
When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own—not of the same blood or birth, but the same mind, and possessing a share of the divine. And so none of them can hurt me. No one can implicate me in ugliness. Nor can I feel angry at my kin, or hate him. We were made to work together like feet, like hands, like the rows of the upper and lower teeth.`
  },
  {
    id: 'gutenberg_sonnets',
    title: 'The Sonnets and Poetry',
    author: 'William Shakespeare',
    category: 'Poetry',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    description: 'Shakespeare\'s immortal 154 sonnets exploring timeless themes of love, beauty, the passage of time, mortality, and art.',
    language: 'en',
    downloadUrl: 'https://www.gutenberg.org/ebooks/1041.txt.utf-8',
    isDownloaded: false,
    lastReadTimestamp: 0,
    lastReadPage: 1,
    totalPages: 28,
    totalReadingTimeSeconds: 0,
    readingSessionsCount: 0,
    isFavorite: false,
    fileSizeBytes: 39000,
    contentPreview: 'Shall I compare thee to a summer\'s day? Thou art more lovely and more temperate...',
    fullContent: `THE SONNETS
By William Shakespeare

--- SONNET 18 ---
Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance or nature's changing course untrimm'd;
But thy eternal summer shall not fade
Nor lose possession of that fair thou owest;
Nor shall Death brag thou wander'st in his shade,
When in eternal lines to time thou growest:
  So long as men can breathe or eyes can see,
  So long lives this and this gives life to thee.`
  },
  {
    id: 'gutenberg_ghalib',
    title: 'Diwan-e-Ghalib & Urdu Poetry',
    author: 'Mirza Asadullah Khan Ghalib',
    category: 'Poetry & Shayari',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    description: 'Philosophical couplets, ghazals, and timeless verses of Mirza Ghalib on longing, existential mystery, fate, and human emotion.',
    language: 'en',
    downloadUrl: undefined,
    isDownloaded: false,
    lastReadTimestamp: 0,
    lastReadPage: 1,
    totalPages: 22,
    totalReadingTimeSeconds: 0,
    readingSessionsCount: 0,
    isFavorite: true,
    fileSizeBytes: 28000,
    contentPreview: 'Hazaaron khwahishen aisi ke har khwahish pe dam nikle, Bahut niklay mere armaan lekin phir bhi kam nikle...',
    fullContent: `DIWAN-E-GHALIB
By Mirza Asadullah Baig Khan (Ghalib)

--- GHAZAL 1: HAZAARON KHWAHISHEN ---
Hazaaron khwahishen aisi ke har khwahish pe dam nikle
Bahut niklay mere armaan lekin phir bhi kam nikle.

(Thousands of desires, each one worth dying for...
Many of my yearnings were fulfilled, yet so few they still seem.)

Daray kyon mera qatil? Kya rahega uski gardan par?
Woh khoon, jo chashm-e-tar se umr bhar yoon dam-ba-dam nikle.

(Why does my slayer fear? What burden shall his neck bear?
The blood that wept endlessly from my drenched eyes has long drained away.)

Mohabbat mein nahin hai farq jeenay aur marnay ka
Usi ko dekh kar jeetay hain jis kafir pe dam nikle.

(In love there is no difference between living and passing away;
We live only by looking upon the very idol for whom our breath departs.)`
  },
  {
    id: 'gutenberg_art_of_war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    category: 'Philosophy & Strategy',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80',
    description: 'Ancient treatise on strategy, tactical flexibility, psychological warfare, leadership, and peaceful resolution without conflict.',
    language: 'en',
    downloadUrl: 'https://www.gutenberg.org/ebooks/132.txt.utf-8',
    isDownloaded: false,
    lastReadTimestamp: 0,
    lastReadPage: 1,
    totalPages: 20,
    totalReadingTimeSeconds: 0,
    readingSessionsCount: 0,
    isFavorite: false,
    fileSizeBytes: 31000,
    contentPreview: 'Sun Tzu said: The art of war is of vital importance to the State. It is a matter of life and death...',
    fullContent: `THE ART OF WAR
By Sun Tzu

--- CHAPTER I: LAYING PLANS ---
1. Sun Tzu said: The art of war is of vital importance to the State.
2. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.
3. The art of war, then, is governed by five constant factors: (1) The Moral Law; (2) Heaven; (3) Earth; (4) The Commander; (5) Method and discipline.
18. All warfare is based on deception. Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive.`
  }
];
