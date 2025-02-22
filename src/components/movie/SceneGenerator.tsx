
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

      if (error) throw error;
      
      const newScene = {
        id: currentScene ? currentScene.id + 1 : 1,
        ...JSON.parse(data.scene)
      };

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
        description: "Failed to generate the next scene",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (choice !== undefined) {
      generateScene(choice);
    } else if (genre && !currentScene && !isGenerating) {
      generateScene();
    }
  }, [genre, choice]);

  return null;
};

export default SceneGenerator;
