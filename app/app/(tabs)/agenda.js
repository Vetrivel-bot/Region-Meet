import React from 'react';
import { Text, ScrollView } from 'react-native';
// 1. Import SafeAreaView from the package we installed
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useQuery } from '@tanstack/react-query'; // Keep your query logic

// --- Styled Components (using your theme) ---

// This is our main screen container.
// We use the <SafeAreaView> component and style it directly.
const ScreenContainer = styled(SafeAreaView)`
  flex: 1;
  /* Use your theme's primary color for the background, 
     so the light status bar text is visible */
  background-color: ${(props) => props.theme.colors.primary};
`;

// A simple styled <View> for the content
// We give this a white/light background for the content cards
const ContentContainer = styled(ScrollView)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.medium}px;
`;

// A title using your theme's text color
const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: ${(props) => props.theme.spacing.large}px;
`;

// A reusable card (like we discussed for Sprint 0)
const StyledCard = styled.View`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.large}px;
  padding: ${(props) => props.theme.spacing.medium}px;
  margin-bottom: ${(props) => props.theme.spacing.medium}px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

// --- FAKE API FUNCTION (for your useQuery) ---
const fetchAgenda = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log('FAKING API FETCH (for Agenda)');
      resolve([
        { id: 1, title: 'Keynote: The Future of AI', time: '9:00 AM' },
        { id: 2, title: 'Workshop: Building with React Native', time: '10:30 AM' },
        { id: 3, title: 'Exhibitor Showcase Opens', time: '12:00 PM' },
      ]);
    }, 1000)
  );
// ---

export default function AgendaScreen() {
  // Your useQuery logic
  const { data: agendaItems, isLoading } = useQuery({
    queryKey: ['agenda'], // This is the key for the cache
    queryFn: fetchAgenda,
  });

  return (
    // 2. Use ScreenContainer (which is a SafeAreaView) as your root component
    // This automatically adds padding for the status bar (top)
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* This content container has a different background 
        and will start *below* the safe area
      */}
      <ContentContainer>
        <Title>Event Agenda</Title>

        {isLoading && <Text>Loading agenda...</Text>}

        {agendaItems?.map((item) => (
          <StyledCard key={item.id}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ color: '#555' }}>{item.time}</Text>
          </StyledCard>
        ))}
      </ContentContainer>
    </ScreenContainer>
  );
}

