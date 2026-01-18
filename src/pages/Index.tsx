import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ChecklistItem {
  id: string;
  title: string;
  regulation: string;
  checked: boolean;
  comment: string;
}

const Index = () => {
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState('');
  const [inspectorSignature, setInspectorSignature] = useState('');
  const [clientSignature, setClientSignature] = useState('');

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', title: 'Сантехника', regulation: 'СП 30.13330.2020, ГОСТ 23289-94', checked: false, comment: '' },
    { id: '2', title: 'Отопление', regulation: 'СП 60.13330.2020, ГОСТ 30494-2011', checked: false, comment: '' },
    { id: '3', title: 'Двери', regulation: 'ГОСТ 31173-2016, СП 54.13330.2016', checked: false, comment: '' },
    { id: '4', title: 'Электрика', regulation: 'ПУЭ 7, ГОСТ Р 50571.1-2009', checked: false, comment: '' },
    { id: '5', title: 'Штукатурка', regulation: 'СП 71.13330.2017, ГОСТ 31724-2012', checked: false, comment: '' },
    { id: '6', title: 'Вентиляция', regulation: 'СП 60.13330.2020, ГОСТ 30494-2011', checked: false, comment: '' },
    { id: '7', title: 'Уровни пола и стен', regulation: 'СП 71.13330.2017, СНиП 3.04.01-87', checked: false, comment: '' },
    { id: '8', title: 'Окна', regulation: 'ГОСТ 30971-2012, СП 23-101-2004', checked: false, comment: '' },
    { id: '9', title: 'Ограждения (балконы/террасы)', regulation: 'ГОСТ 25772-83, СП 54.13330.2016', checked: false, comment: '' },
    { id: '10', title: 'Фасад', regulation: 'СП 293.1325800.2017, ГОСТ 31310-2015', checked: false, comment: '' },
  ]);

  const handleCheckChange = (id: string, checked: boolean) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  const handleCommentChange = (id: string, comment: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, comment } : item
    ));
  };

  const exportToPDF = async () => {
    const element = document.getElementById('inspection-report');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Акт_осмотра_${inspectionDate}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Акт осмотра квартиры</h1>
          <Button onClick={exportToPDF} className="gap-2">
            <Icon name="Download" size={20} />
            Экспорт в PDF
          </Button>
        </div>

        <div id="inspection-report" className="bg-white p-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Данные инспектора</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">ИП:</p>
                  <p>Шилохвостов Владислав Дмитриевич</p>
                </div>
                <div>
                  <p className="font-semibold">ИНН:</p>
                  <p>860236335706</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold">ОГРНИП:</p>
                  <p>325861700037662</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Данные осмотра</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Адрес / Объект приёмки</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Введите адрес объекта"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Дата приёмки</Label>
                <Input
                  id="date"
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Результаты проверки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`check-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`check-${item.id}`} className="text-base font-semibold cursor-pointer">
                          {item.title}
                        </Label>
                        <p className="text-xs text-muted-foreground">{item.regulation}</p>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Замечания (если есть)"
                      value={item.comment}
                      onChange={(e) => handleCommentChange(item.id, e.target.value)}
                      className="ml-9"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Электронные подписи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="inspector-signature">Подпись инспектора</Label>
                <Input
                  id="inspector-signature"
                  value={inspectorSignature}
                  onChange={(e) => setInspectorSignature(e.target.value)}
                  placeholder="Введите ваше ФИО"
                />
                {inspectorSignature && (
                  <div className="border-t-2 border-primary pt-2 text-center">
                    <p className="font-semibold italic text-lg">{inspectorSignature}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="client-signature">Подпись клиента</Label>
                <Input
                  id="client-signature"
                  value={clientSignature}
                  onChange={(e) => setClientSignature(e.target.value)}
                  placeholder="Введите ФИО клиента"
                />
                {clientSignature && (
                  <div className="border-t-2 border-primary pt-2 text-center">
                    <p className="font-semibold italic text-lg">{clientSignature}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground text-center pt-4">
            <p>Дата формирования акта: {new Date().toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
