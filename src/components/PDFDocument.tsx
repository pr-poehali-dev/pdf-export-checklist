import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Roboto',
    lineHeight: 1.3,
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  infoSection: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 8,
  },
  label: {
    fontWeight: 700,
    width: 80,
  },
  value: {
    flex: 1,
  },
  checklistSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: '1pt solid #333',
    paddingBottom: 3,
  },
  checklistItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '0.5pt solid #e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  itemNumber: {
    width: 15,
    fontWeight: 700,
  },
  itemTitle: {
    flex: 1,
    fontWeight: 700,
    fontSize: 9,
  },
  regulation: {
    fontSize: 7,
    color: '#666',
    marginLeft: 15,
    marginBottom: 3,
  },
  complianceRow: {
    flexDirection: 'row',
    marginLeft: 15,
    marginBottom: 3,
    fontSize: 8,
  },
  checkbox: {
    width: 10,
    height: 10,
    border: '1pt solid #333',
    marginRight: 5,
    marginTop: 1,
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    border: '1pt solid #333',
    marginRight: 5,
    marginTop: 1,
    backgroundColor: '#333',
  },
  checkboxLabel: {
    marginRight: 15,
  },
  comment: {
    marginLeft: 15,
    fontSize: 8,
    color: '#333',
    marginTop: 2,
    fontStyle: 'italic',
  },
  signatureSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: '1pt solid #333',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 8,
    marginBottom: 15,
    fontWeight: 700,
  },
  signatureLine: {
    borderBottom: '1pt solid #333',
    marginBottom: 3,
  },
  signatureHint: {
    fontSize: 6,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#666',
  },
});

interface ChecklistItem {
  id: string;
  title: string;
  regulation: string;
  compliance: 'compliant' | 'non-compliant' | 'not-checked';
  comment: string;
}

interface PDFDocumentProps {
  address: string;
  inspectionDate: string;
  checklist: ChecklistItem[];
}

const PDFDocument = ({ address, inspectionDate, checklist }: PDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>АКТ ОСМОТРА КВАРТИРЫ</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ИП:</Text>
          <Text style={styles.value}>Шилохвостов Владислав Дмитриевич</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ИНН:</Text>
          <Text style={styles.value}>860236335706</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>ОГРНИП:</Text>
          <Text style={styles.value}>325861700037662</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Адрес:</Text>
          <Text style={styles.value}>{address || '___________________________'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Дата приёмки:</Text>
          <Text style={styles.value}>{new Date(inspectionDate).toLocaleDateString('ru-RU')}</Text>
        </View>
      </View>

      <View style={styles.checklistSection}>
        <Text style={styles.sectionTitle}>Результаты проверки</Text>
        
        {checklist.map((item, index) => (
          <View key={item.id} style={styles.checklistItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>{index + 1}.</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
            
            <Text style={styles.regulation}>{item.regulation}</Text>
            
            <View style={styles.complianceRow}>
              <View style={item.compliance === 'compliant' ? styles.checkboxChecked : styles.checkbox} />
              <Text style={styles.checkboxLabel}>Соответствует нормам</Text>
              
              <View style={item.compliance === 'non-compliant' ? styles.checkboxChecked : styles.checkbox} />
              <Text style={styles.checkboxLabel}>Не соответствует нормам</Text>
            </View>
            
            {item.comment && (
              <Text style={styles.comment}>Замечания: {item.comment}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Инспектор:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>(подпись)</Text>
          </View>
          
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Клиент:</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureHint}>(подпись)</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Дата формирования документа: {new Date().toLocaleDateString('ru-RU')}</Text>
      </View>
    </Page>
  </Document>
);

export default PDFDocument;
