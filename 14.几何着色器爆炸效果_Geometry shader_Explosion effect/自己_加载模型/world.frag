#version 330 core//片段着色器代码

in GS_OUT{
	vec3 Normal;
	vec3 FragPos;
	vec2 TexCoords;
}fs_in;
out vec4 color;

struct Material//物体材质：自己本身颜色、镜面反射强度、散射半径
{
sampler2D  texture_diffuse1;  //物体漫反射的颜色（物体本质颜色）
sampler2D texture_specular1; //镜面反射是不是很亮
float shininess;//散射半径
};

struct DirLight //平行光的属性
{
vec3 direction;//方向
vec3 ambient;
vec3 diffuse;
vec3 specular;
};

struct PointLight
{
vec3 position;
vec3 ambient;
vec3 diffuse;
vec3 specular;
float Kc;
float Kl;
float Kq;

};

uniform vec3 cameraPos;
uniform Material material;
uniform DirLight dirlight;
uniform PointLight pointLights;


//光照计算函数/////////////////
vec3 CalcDirLight(DirLight light,Material imaterial, vec3 norm, vec3 viewDir)//平行光计算函数
{
    //全局光照
    vec3 ambient = light.ambient * vec3(texture(imaterial.texture_diffuse1,fs_in.TexCoords));//全局光照
	//漫反射分量
	vec3 lightDir = normalize( -light.direction);
	float diff = max(dot(norm,lightDir) , 0.0);//漫反射因子
	vec3 diffuse = diff * light.diffuse * vec3(texture(imaterial.texture_diffuse1,fs_in.TexCoords));//漫反射光分量
	//镜面反射
	vec3 reflectDir = reflect(-lightDir, norm);//经过反射后的光角度
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), imaterial.shininess );//镜面反射因子，32是物体的发光值，发光值（光滑度）越高反射能力越强
	vec3 specular =  spec * light.specular * vec3(texture(imaterial.texture_specular1,fs_in.TexCoords));//镜面反射光分量 
	return(diffuse + ambient + specular);
}

vec3 CalcPointLight(PointLight light,Material imaterial, vec3 fragPos, vec3 norm, vec3 viewDir)
{
   //全局光照
    vec3 ambient = light.ambient * vec3(texture(imaterial.texture_diffuse1,fs_in.TexCoords));//全局光照
	//漫反射分量
	vec3 lightDir = normalize(light.position - fragPos);
	float diff = max(dot(norm,lightDir) , 0.0);//漫反射因子
	vec3 diffuse = diff * light.diffuse * vec3(texture(imaterial.texture_diffuse1,fs_in.TexCoords));//漫反射光分量
	//镜面反射
	vec3 reflectDir = reflect(-lightDir, norm);//经过反射后的光角度
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), imaterial.shininess );//镜面反射因子，32是物体的发光值，发光值（光滑度）越高反射能力越强
	vec3 specular =  vec3(texture(imaterial.texture_specular1,fs_in.TexCoords)) * spec * light.specular;//镜面反射光分量
	//衰退量
	float distance = length(light.position - fragPos);
	float attenuation = 1.0/(light.Kc + light.Kl*distance + light.Kq*distance*distance);

	return((diffuse + ambient + specular)*attenuation);
}

void main()
    {
	vec3 result;
	vec3 norm = normalize(fs_in.Normal);//将法向量单位化
	vec3 viewDir = normalize(cameraPos - fs_in.FragPos);//片段与玩家视角所成角度
	result = CalcDirLight(dirlight,material, norm, viewDir );
	result += CalcPointLight(pointLights,material,fs_in.FragPos, norm, viewDir);

    color = vec4(result, 1.0f);
	
    }