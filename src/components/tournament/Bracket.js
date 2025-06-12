// src/components/tournament/Bracket.js
import React, { useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  SportsEsports as GameIcon
} from '@mui/icons-material';
import { apiService } from '../../services/api';

function Bracket({ tournament, isOrganizer, refreshTournament, onMatchResult }) {
    const bracketRef = useRef(null);

    const updateResult = async (matchId, winnerId) => {
        console.log('Bracket updateResult called:', { tournamentId: tournament._id || tournament.id, matchId, winnerId });
        
        // Simply call the parent's match result handler - it will handle both optimistic updates and backend sync
        if (onMatchResult) {
            await onMatchResult(matchId, winnerId);
        } else {
            console.warn('No onMatchResult handler provided to Bracket component');
        }
    };

    const getRounds = (matches) => {
        if (!matches || matches.length === 0) return [];
        
        // Group matches by their round property
        const roundsMap = {};
        matches.forEach(match => {
            const roundNum = match.round || 1;
            if (!roundsMap[roundNum]) {
                roundsMap[roundNum] = [];
            }
            roundsMap[roundNum].push(match);
        });
        
        // Convert to array and sort by round number
        const rounds = [];
        const sortedRoundNumbers = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);
        
        sortedRoundNumbers.forEach(roundNum => {
            rounds.push(roundsMap[roundNum]);
        });
        
        console.log('Organized rounds:', rounds);
        return rounds;
    };

    const renderConnectors = () => {
        const connectors = [];
        const rounds = getRounds(tournament.matches);
        const bracketEl = bracketRef.current;
        if (!bracketEl) return connectors;

        rounds.forEach((round, roundIndex) => {
            const roundEl = bracketEl.querySelector(`.round-${roundIndex}`);
            const nextRoundEl = bracketEl.querySelector(`.round-${roundIndex + 1}`);
            if (!roundEl || !nextRoundEl) return;

            const matches = roundEl.querySelectorAll('.match');
            const nextMatches = nextRoundEl.querySelectorAll('.match');

            matches.forEach((matchEl, matchIndex) => {
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const nextMatchEl = nextMatches[nextMatchIndex];
                if (!nextMatchEl) return;

                const matchRect = matchEl.getBoundingClientRect();
                const nextMatchRect = nextMatchEl.getBoundingClientRect();
                const bracketRect = bracketEl.getBoundingClientRect();

                const x1 = matchRect.right - bracketRect.left + 10;
                const y1 = matchRect.top + matchRect.height / 2 - bracketRect.top;
                const x2 = nextMatchRect.left - bracketRect.left - 10;
                const y2 = nextMatchRect.top + nextMatchRect.height / 2 - bracketRect.top;

                connectors.push(
                    <path
                        key={`connector-${roundIndex}-${matchIndex}`}
                        d={`M ${x1},${y1} C ${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`}
                        stroke="#888"
                        strokeWidth="2"
                        fill="none"
                    />
                );
            });
        });

        return connectors;
    };

    if (!tournament.matches || tournament.matches.length === 0) {
        return (
            <Alert severity="info">
                No matches available yet. The bracket will appear once the tournament starts and matches are generated.
            </Alert>
        );
    }

    console.log('Bracket component received tournament:', tournament);
    console.log('Bracket component received matches:', tournament.matches);

    const rounds = getRounds(tournament.matches);

    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            {/* SVG Connectors */}
            <Box
                component="svg"
                ref={bracketRef}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                }}
            >
                {renderConnectors()}
            </Box>

            {/* Bracket Rounds */}
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
                {rounds.map((round, roundIndex) => (
                    <Grid item xs={12} md={12 / rounds.length} key={roundIndex}>
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                p: 2, 
                                height: '100%',
                                backgroundColor: 'background.paper'
                            }}
                            className={`round round-${roundIndex}`}
                        >
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600, 
                                    mb: 2, 
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1
                                }}
                            >
                                {roundIndex === rounds.length - 1 ? (
                                    <>
                                        <TrophyIcon color="primary" />
                                        Final
                                    </>
                                ) : (
                                    <>
                                        <GameIcon color="primary" />
                                        Round {roundIndex + 1}
                                    </>
                                )}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {round.map((match) => (
                                    <Card 
                                        key={match.id || match._id} 
                                        variant="outlined"
                                        className="match"
                                        sx={{ 
                                            p: 2,
                                            backgroundColor: match.winner ? 'success.light' : 'background.default',
                                            opacity: match.winner ? 0.9 : 1,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {/* Participants */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: match.winner && (match.winner.id || match.winner._id) === (match.participant1?.id || match.participant1?._id) ? 700 : 400,
                                                    color: match.winner && (match.winner.id || match.winner._id) === (match.participant1?.id || match.participant1?._id) ? 'success.main' : 'text.primary'
                                                }}
                                            >
                                                {match.participant1 ? (match.participant1.username || match.participant1.name) : 'TBD'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                                                vs
                                            </Typography>
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: match.winner && (match.winner.id || match.winner._id) === (match.participant2?.id || match.participant2?._id) ? 700 : 400,
                                                    color: match.winner && (match.winner.id || match.winner._id) === (match.participant2?.id || match.participant2?._id) ? 'success.main' : 'text.primary'
                                                }}
                                            >
                                                {match.participant2 ? (match.participant2.username || match.participant2.name) : 'TBD'}
                                            </Typography>
                                        </Box>

                                        {/* Winner Display */}
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                            {match.winner ? (
                                                <Chip 
                                                    icon={<TrophyIcon />}
                                                    label={`Winner: ${match.winner.username || match.winner.name}`}
                                                    color="success"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip 
                                                    label="Pending"
                                                    color="default"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>

                                        {/* Organizer Actions */}
                                        {isOrganizer && !match.winner && match.participant1 && match.participant2 && (
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => updateResult(match.id || match._id, match.participant1.id || match.participant1._id)}
                                                >
                                                    {match.participant1.username || match.participant1.name} Wins
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={() => updateResult(match.id || match._id, match.participant2.id || match.participant2._id)}
                                                >
                                                    {match.participant2.username || match.participant2.name} Wins
                                                </Button>
                                            </Box>
                                        )}
                                        
                                        {/* Bye Match Indicator */}
                                        {((!match.participant1 || match.participant1.username === 'TBD') || 
                                          (!match.participant2 || match.participant2.username === 'TBD')) && 
                                         !match.winner && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                                <Chip 
                                                    label="Bye - Auto Advance"
                                                    color="info"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        )}
                                    </Card>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Bracket;