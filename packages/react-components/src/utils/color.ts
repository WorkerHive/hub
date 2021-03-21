interface RGB{
    b: number;
    g: number;
    r: number;
}

function rgbToYIQ({ r, g, b} : RGB){
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}

function hexToRgb(hex: string): RGB | undefined{
    if(!hex || hex === undefined){
        return undefined;
    }

    const result : RegExpExecArray | null =           
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : undefined;
}

export function contrast(colorHex: string | undefined, threshold: number = 128): string {
    if(colorHex === undefined){
        return '#000';
    }

    const rgb : RGB | undefined = hexToRgb(colorHex);

    if(rgb === undefined){
        return '#000';
    }

    return rgbToYIQ(rgb) >= threshold ? '#000' : '#fff';
}

export function textToColor(text: string){
    return intToRGB(hashCode(text));
}

 function hashCode(str: string) { // java String#hashCode
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  } 

  function intToRGB(i: number){
      var c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase();

      return "00000".substring(0, 6 - c.length) + c;
  }