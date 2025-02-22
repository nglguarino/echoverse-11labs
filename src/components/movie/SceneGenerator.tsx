
import { useEffect } from 'react';
import { useMovieStore } from '@/stores/movieStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface SceneGeneratorProps {
  onConversationStart: () => void;
  choice?: string;
}

const SceneGenerator = ({ onConversationStart, choice }: SceneGeneratorProps) => {
  const { 
    genre, 
    currentScene, 
    setCurrentScene, 
    addToHistory, 
    isGenerating, 
    setIsGenerating,
    storyBackground,
    setStoryBackground 
  } = useMovieStore();
  const { toast } = useToast();

  const generateScene = async (userChoice?: string) => {
    if (!genre) {
      console.error('No genre selected');
      return;
    }

    console.log('Generating scene for genre:', genre);
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene', {
        body: { 
          genre,
          currentScene,
          lastChoice: userChoice,
          storyBackground
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.scene) {
        console.error('No scene data received');
        throw new Error('No scene data received from the server');
      }

      console.log('Received scene data:', data);
      
      const newScene = {
        id: currentScene ? currentScene.id + 1 : 1,
        ...JSON.parse(data.scene)
      };

      console.log('Parsed new scene:', newScene);

      if (!currentScene && !storyBackground) {
        setStoryBackground(newScene.background);
      }

      if (currentScene) {
        addToHistory(currentScene);
      }
      
      if (storyBackground) {
        newScene.background = storyBackground;
      }
      
      setCurrentScene(newScene);
      onConversationStart();

    } catch (error) {
      console.error('Error generating scene:', error);
      toast({
        title: "Error",
        description: "Failed to generate the next scene. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const initializeScene = async () => {
      if (genre && !currentScene && !isGenerating) {
        console.log('Initializing first scene for genre:', genre);
        await generateScene();
      }
    };

    initializeScene();
  }, [genre]);

  useEffect(() => {
    if (choice !== undefined) {
      generateScene(choice);
    }
  }, [choice]);

  return null;
};

export default SceneGenerator;
