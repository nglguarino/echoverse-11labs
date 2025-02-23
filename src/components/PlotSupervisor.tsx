
import { useEffect } from 'react';
import { usePlotSupervisorStore, type PlotEvent } from '@/stores/plotSupervisorStore';
import { useMovieStore } from '@/stores/movieStore';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export const PlotSupervisor = () => {
  const { toast } = useToast();
  const { 
    characters, 
    plotEvents, 
    tension, 
    storyPhase,
    currentThemes,
    addPlotEvent,
    setTension,
    setStoryPhase
  } = usePlotSupervisorStore();
  
  const { 
    currentScene, 
    genre,
    setCurrentScene,
    setIsGenerating,
    addToHistory 
  } = useMovieStore();

  const analyzePlotProgression = async () => {
    if (!currentScene || !genre) return;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-plot', {
        body: {
          currentScene,
          plotEvents: plotEvents.slice(-5), // Last 5 events for context
          characters,
          tension,
          storyPhase,
          currentThemes,
          genre
        }
      });

      if (error) throw error;

      const analysis = data.analysis;
      
      // Update story state based on AI analysis
      if (analysis.shouldEndStory) {
        const event: PlotEvent = {
          type: 'decision',
          content: analysis.endReason,
          consequence: 'Story ended',
          severity: 10,
          timestamp: Date.now()
        };
        addPlotEvent(event);
        // Instead of modifying the scene directly, we'll set an empty choices array
        if (currentScene) {
          const updatedScene = {
            ...currentScene,
            choices: [],
            isComplete: true
          };
          setCurrentScene(updatedScene);
        }
        return;
      }

      // Update tension based on recent events
      if (analysis.suggestedTension !== tension) {
        setTension(analysis.suggestedTension);
      }

      // Progress story phase if needed
      if (analysis.suggestedPhase !== storyPhase) {
        setStoryPhase(analysis.suggestedPhase);
      }

      // Generate new scene with AI suggestions
      const { data: sceneData, error: sceneError } = await supabase.functions.invoke('generate-scene', {
        body: {
          genre,
          currentScene,
          plotSuggestions: analysis.plotSuggestions,
          requiredCharacters: analysis.requiredCharacters,
          tension,
          storyPhase
        }
      });

      if (sceneError) throw sceneError;

      if (currentScene) {
        addToHistory(currentScene);
      }

      const newScene = JSON.parse(sceneData.scene);
      setCurrentScene(newScene);

    } catch (error) {
      console.error('Error in plot analysis:', error);
      toast({
        title: "Error",
        description: "Failed to analyze plot progression",
        variant: "destructive",
      });
    }
  };

  // Analyze plot after each scene change
  useEffect(() => {
    if (currentScene) {
      analyzePlotProgression();
    }
  }, [currentScene]);

  // No UI rendering - this is a controller component
  return null;
};

export default PlotSupervisor;
