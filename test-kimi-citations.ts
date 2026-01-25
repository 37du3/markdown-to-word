import { preprocessMarkdown } from './src/lib/preprocessor';

// Test with Kimi citation markers
const kimiContent = `
### **二、针对特定问题的搭配**

- **大餐后消食**：**陈皮+山楂**（或山楂红茶）→促进脂肪分解，缓解积食【^1^】【^11^】
- **夏季消暑**：**陈皮+蜂蜜**→消暑解郁，酸甜开胃【^3^】
- **咽喉不适**：**陈皮+柠檬**→缓解咽喉炎，补充维生素C【^3^】【^10^】
- **清肺化痰**：**陈皮+雪梨+百合**→经典润肺方，适合干燥季节【^12^】
- **疏肝理气**：**陈皮+玫瑰花/桂花**→舒缓情绪，适合压力大者【^7^】【^11^】

### **三、重要注意事项**

1. **用量适中**：每天3-5克为宜，过量易刺激胃黏膜【^1^】
2. **冲泡方法**：必须用沸水焖泡5-10分钟，有效成分才能充分溶出【^1^】
3. **饮用时机**：饭后半小时饮用最佳，**切勿空腹喝**（易刺激胃）【^1^】
`;

console.log('=== Original Kimi Content ===');
console.log(kimiContent);

console.log('\n=== After AI Cleaning ===');
const cleaned = preprocessMarkdown(kimiContent);
console.log(cleaned);

console.log('\n=== Checking for remaining markers ===');
const hasKimiMarkers = cleaned.includes('【^');
const hasEmptyBrackets = cleaned.includes('【】');
const hasWesternMarkers = /\[\d+\]/.test(cleaned);

console.log(`Kimi markers (【^数字^】) remaining: ${hasKimiMarkers ? '❌ YES' : '✅ NO'}`);
console.log(`Empty brackets (【】) remaining: ${hasEmptyBrackets ? '❌ YES' : '✅ NO'}`);
console.log(`Western markers ([数字]) remaining: ${hasWesternMarkers ? '❌ YES' : '✅ NO'}`);

if (!hasKimiMarkers && !hasEmptyBrackets && !hasWesternMarkers) {
    console.log('\n🎉 SUCCESS: All citation markers cleaned properly!');
} else {
    console.log('\n⚠️  FAILED: Some markers still present');
}
