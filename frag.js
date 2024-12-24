const frag = function (items) {
    const ifLoop = items
        .map((item, index) => {
            return `
			if (index == ${index}) { return texture2D(textures[${index}], uv); }
		`;
        })
        .join(" else ");

    return `

	#ifdef GL_ES
precision highp float;
#endif

#define MAX ${items.length}

uniform float u_time;
uniform vec2 u_resolution;

uniform float timeline;

uniform sampler2D textures[MAX];

uniform float startIndex;
uniform float endIndex;

varying vec3 v_normal;
varying vec2 v_texcoord;
	
	${includes}

vec4 sampleColor(int index, vec2 uv) {
    ${ifLoop}
    
    return vec4(1.0, 1.0, 1.0, 1.0);
}

void main(void)
{
    vec2 uv = v_texcoord;
    
    // The following chunk of code serves the purpose of "expanding" the uv from the center rather than from the bottom left corner as it is by default
    // because by default, if you multiply the uv by any positive number (such as uv *= 0.3), you will see the image going off-screen, exactly because it is not expanding from the center
    uv -= 0.5;
    float wave = fbm(3.5 * uv + 0.2 * u_time);
    float strength = smoothstep(0.0, 1.0, timeline) - smoothstep(2.0, 3.0, timeline); // the second smoothstep basically "resets" the wave effect once we get around 2 and 3 on the timeline variable which is a value that goes from 0 to 5, in order to create a fade in fade out effect
    float distortion = mix(1.0, 1.0 + strength, wave); // the first parameter is the maximum while the second one increases the wave intensity
    uv *= distortion; // "expansion number" basically how far you want to expand it from the center
    uv += 0.5;
    // uv.y = 1.0 - uv.y; // this is the usual code line used on kodelife to flip the image the correct way, but it will do the opposite on the web so comment this code when exporting this project on to the web
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    // This gets rid of the extra space around the image
        discard;
    }
    
    // pick images
    // int() converts the float number into an integer
    vec4 startTexture = sampleColor(int(startIndex), uv);
    vec4 endTexture = sampleColor(int(endIndex), uv);
    
    // between
    float changeTimeline = smoothstep(0.5, 2.5, timeline); // fade in fade out to switch between the 2 images
    float mixer = 1.0 - step(changeTimeline, wave);
    
    vec4 color = mix(startTexture, endTexture, mixer);
    
    gl_FragColor = color;
}

`;
};
