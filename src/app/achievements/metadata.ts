export interface AchievementMetadata {
  title: string;
  desc?: string;
  category:
    | 'proud'
    | 'pawn'
    | 'piece'
    | 'alphabet'
    | 'checkmate'
    | 'funny'
    | 'speed'
    | 'adoption'
    | 'dirty';
}

export const ACHIEVEMENTS_METADATA: Record<string, AchievementMetadata> = {
  castleAfterMove40: {
    title: 'Castle after Move 40',
    desc: "It's never too late to castle",
    category: 'funny',
  },
  pawnCheckmate: {
    title: 'Checkmate with a Pawn',
    desc: 'A pawn delivers mate',
    category: 'checkmate',
  },
  g5mate: {
    title: 'g5#',
    desc: 'Pawn checkmate on g5',
    category: 'checkmate',
  },
  enPassantCheckmate: {
    title: 'En Passant Checkmate',
    desc: 'Checkmate by capturing en passant',
    category: 'checkmate',
  },
  castleKingsideWithCheckmate: {
    title: 'O-O#',
    desc: 'Castle kingside with mate',
    category: 'checkmate',
  },
  castleQueensideWithCheckmate: {
    title: 'O-O-O#',
    desc: 'Castle queenside with mate',
    category: 'checkmate',
  },
  checkmateWithKing: {
    title: 'Checkmate with King',
    desc: 'Move your king with a discovery or by castling',
    category: 'checkmate',
  },
  promoteToBishopCheckmate: {
    title: 'Promote to Bishop Checkmate',
    category: 'checkmate',
  },
  promoteToKnightCheckmate: {
    title: 'Promote to Knight Checkmate',
    category: 'checkmate',
  },
  promotePawnBeforeMoveNumber: {
    title: 'Promote a Pawn within 8 Moves',
    category: 'funny',
  },
  smotheredMate: {
    title: 'Smothered Mate',
    category: 'checkmate',
  },
  smotheredPorkMate: {
    title: 'Smothered Pork Checkmate',
    desc: 'Smother + Pin + Fork',
    category: 'checkmate',
  },
  blockCheckWithCheckmate: {
    title: 'Block a Check with Checkmate',
    desc: 'Call an ambulance... but not for me',
    category: 'checkmate',
  },
  royalFamilyFork: {
    title: 'Royal Family Fork',
    desc: 'Knight forks K+Q+R and 1 other piece',
    category: 'funny',
  },
  noCapturesBeforeMoveNumber: {
    title: 'No Captures before Move 30',
    desc: 'All the pieces survive till move 30',
    category: 'funny',
  },
  rosenTrap: {
    title: 'Rosen Trap',
    desc: 'King goes to the corner instead of capturing the queen',
    category: 'proud',
  },
  castleFork: {
    title: 'Castle Fork',
    desc: 'Castle with check and then your king captures a piece',
    category: 'proud',
  },
  avoidTheFlagCheckmate: {
    title: 'Avoid-the-Flag Checkmate',
    desc: 'Make 20+ moves with 1 second left + checkmate (Lichess only)',
    category: 'speed',
  },
  checkmateWithTenthSecondLeft: {
    title: 'Checkmate with 0.1 seconds',
    desc: 'Checkmate with 1/3 second left (non-increment games)',
    category: 'speed',
  },
  consecutiveCapturesSameSquare: {
    title: '10+ Consecutive Captures on the Same Square',
    category: 'funny',
  },
  ohNoMyQueen: {
    title: 'Oh No My Queen',
    desc: 'Sacrifice your Queen for mate',
    category: 'proud',
  },
  lefongTrap: {
    title: 'Lefong',
    desc: 'Capture a premoved fianchettoed bishop',
    category: 'dirty',
  },
  flagOpponentWhoHadMateInOne: {
    title: 'Flag Opponent Who Had Mate in 1',
    desc: 'Young children, close your eyes',
    category: 'dirty',
  },
  pawnStormOpening: {
    title: '12 Pawn Move Opening Win',
    desc: 'Win a game after 12+ consecutive pawn moves in the opening',
    category: 'funny',
  },
  quadrupledPawns: {
    title: 'Quadrupled Pawns',
    desc: '4 pawns on the same file',
    category: 'pawn',
  },
  pawnCube: {
    title: 'Pawn Cube',
    desc: 'Is your pawn cube indestructible?',
    category: 'pawn',
  },
  pawnCubeCenter: {
    title: 'Center Pawn Cube',
    desc: 'Pawn cube in the exact center of the board',
    category: 'pawn',
  },
  pawnX: {
    title: 'Pawn X',
    desc: 'X-formation with pawns',
    category: 'pawn',
  },
  pawnDiamond: {
    title: 'Pawn Diamond',
    desc: 'Does your pawn diamond last forever?',
    category: 'pawn',
  },
  pawnDiamondSolid: {
    title: 'Solid Pawn Diamond',
    desc: 'A 5 carat pawn diamond',
    category: 'pawn',
  },
  doublePawnDiamond: {
    title: 'Double Pawn Diamond',
    category: 'pawn',
  },
  knightCube: {
    title: 'Knight Cube',
    category: 'piece',
  },
  knightRectangle: {
    title: 'Knight Rectangle',
    category: 'piece',
  },
  connectEightOnRank: {
    title: 'Connect 8 on Rank',
    category: 'pawn',
  },
  'connectEightOnRank:4': {
    title: 'Connect 8 on 4th Rank',
    category: 'pawn',
  },
  'connectEightOnRank:5': {
    title: 'Connect 8 on 5th Rank',
    category: 'pawn',
  },
  'connectEightOnRank:6': {
    title: 'Connect 8 on 6th Rank',
    category: 'pawn',
  },
  'connectEightOnRank:7': {
    title: 'Connect 8 on 7th Rank',
    category: 'pawn',
  },
  sixPawnsInTheSameFile: {
    title: '6 Pawns on the Same File',
    category: 'pawn',
  },
  connectDiagonally: {
    title: 'Connect Diagonally',
    category: 'pawn',
  },
  'connectDiagonally:5': {
    title: 'Connect 5',
    desc: 'Connect 5 of your pawns diagonally',
    category: 'pawn',
  },
  'connectDiagonally:6': {
    title: 'Connect 6',
    desc: 'Connect 6 of your pawns diagonally',
    category: 'pawn',
  },
  stalemateTricks: {
    title: 'Stalemate Tricks',
    desc: 'Stalemate from a losing position',
    category: 'proud',
  },
  bishopAndKnightMate: {
    title: 'Bishop + Knight Checkmate',
    category: 'checkmate',
  },
  twoBishopMate: {
    title: '2-Bishop Checkmate',
    desc: 'Checkmate when you only have 2 bishops',
    category: 'checkmate',
  },
  fourKnightMate: {
    title: '4-Knight Checkmate',
    category: 'checkmate',
  },
  fourKnightCubeMate: {
    title: '4-Knight Cube Checkmate',
    desc: 'You have 4 knights and checkmate from a cube',
    category: 'checkmate',
  },
  sixKnightRectangleMate: {
    title: '6-Knight Rectangle Checkmate',
    category: 'checkmate',
  },
  winInsufficientMaterial: {
    title: 'Win with Insufficient Material',
    desc: 'Flag your opponent with only a knight or bishop (Lichess only)',
    category: 'dirty',
  },
  clutchPawn: {
    title: 'Clutch Pawn',
    desc: 'Win with 1 pawn while down 10+ points in material',
    category: 'dirty',
  },
  doubleCheckCheckmate: {
    title: 'Double-Check Checkmate',
    desc: "2 pieces are attacking the king and it's checkmate",
    category: 'checkmate',
  },
  monaLisaCheckmate: {
    title: 'Mona Lisa Checkmate',
    desc: 'Checkmate the opponent with all your pieces on their original squares',
    category: 'checkmate',
  },
  'checkmateAtMoveNumber:2': {
    title: 'Checkmate in 2 Moves',
    desc: 'Deliver checkmate in 2 moves',
    category: 'checkmate',
  },
  'checkmateAtMoveNumber:3': {
    title: 'Checkmate in 3 Moves',
    desc: 'Deliver checkmate in 3 moves',
    category: 'checkmate',
  },
  'checkmateAtMoveNumber:4': {
    title: 'Checkmate in 4 Moves',
    desc: 'Deliver checkmate in 4 moves',
    category: 'checkmate',
  },
  'alphabet:badegg': {
    title: 'Bad Egg',
    desc: 'Win after spelling "badegg" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:beachcafe': {
    title: 'BeachCafé',
    desc: 'Win after spelling "beachcafe" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:beef': {
    title: 'Beef',
    desc: 'Win after spelling "beef" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:cabbage': {
    title: 'Cabbage',
    desc: 'Win after spelling "cabbage" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:chad': {
    title: 'Chad',
    desc: 'Win after spelling "chad" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:egg': {
    title: 'Egg',
    desc: 'Win after spelling "egg" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:eggegg': {
    title: 'Double Egg (EggEgg)',
    desc: 'Win after spelling "eggegg" with pawn moves in the opening',
    category: 'alphabet',
  },
  'alphabet:headache': {
    title: 'Headache',
    desc: 'Win after spelling "headache" with pawn moves in the opening',
    category: 'alphabet',
  },
  'adoptionMatch:10': {
    title: 'Adoption',
    desc: 'Win 10 consecutive games against the same opponent',
    category: 'adoption',
  },
  'adoptionMatch:20': {
    title: 'Double Adoption',
    desc: 'Win 20 consecutive games against the same opponent',
    category: 'adoption',
  },
};

export const ACHIEVEMENT_CATEGORIES: Record<AchievementMetadata['category'], string> = {
  proud: 'Make Eric Proud',
  pawn: 'Pawn Structures',
  piece: 'Piece Structures',
  alphabet: 'Alphabet Openings',
  checkmate: 'Checkmates',
  funny: "There's a Funny Line",
  speed: 'Speed',
  adoption: 'Adoption Matches',
  dirty: 'I feel so dirty',
};
